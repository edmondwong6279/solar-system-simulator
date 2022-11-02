import { Spring, Vec3, Body } from 'cannon-es';

export default class Gravity extends Spring {
	scale: number;
	// constructors
	constructor(
		bodyA: Body,
		bodyB: Body,
		options: {
			/**
			 * Anchor for bodyA in local bodyA coordinates.
			 * Where to hook the spring to body A, in local body coordinates.
			 * @default new Vec3()
			 */
			scale?: number;
			/**
			 * Anchor for bodyA in local bodyA coordinates.
			 * Where to hook the spring to body A, in local body coordinates.
			 * @default new Vec3()
			 */
			localAnchorA?: Vec3;
			/**
			 * Anchor for bodyB in local bodyB coordinates.
			 * Where to hook the spring to body B, in local body coordinates.
			 * @default new Vec3()
			 */
			localAnchorB?: Vec3;
			/**
			 * Where to hook the spring to body A, in world coordinates.
			 */
			worldAnchorA?: Vec3;
			/**
			 * Where to hook the spring to body B, in world coordinates.
			 */
			worldAnchorB?: Vec3;
		} = {}
	) {
		super(bodyA, bodyB, options); // calling Parent's constructor
		this.scale = options.scale || 1;
	}

	applyForce(): void {
		const { bodyA } = this;
		const { bodyB } = this;
		const r = applyForce_r;
		const r_unit = applyForce_r_unit;
		const u = applyForce_u;
		const f = applyForce_f;
		const tmp = applyForce_tmp;
		const worldAnchorA = applyForce_worldAnchorA;
		const worldAnchorB = applyForce_worldAnchorB;
		const ri = applyForce_ri;
		const rj = applyForce_rj;
		const ri_x_f = applyForce_ri_x_f;
		const rj_x_f = applyForce_rj_x_f;

		const G = 6.673889e-11;

		// Get world anchors
		this.getWorldAnchorA(worldAnchorA);
		this.getWorldAnchorB(worldAnchorB);

		// Get offset points
		worldAnchorA.vsub(bodyA.position, ri);
		worldAnchorB.vsub(bodyB.position, rj);

		// Compute distance vector between world anchor points
		worldAnchorB.vsub(worldAnchorA, r);
		const rlen = r.length();
		r_unit.copy(r);
		r_unit.normalize();

		// Compute relative velocity of the anchor points, u
		bodyB.velocity.vsub(bodyA.velocity, u);
		// Add rotational velocity

		bodyB.angularVelocity.cross(rj, tmp);
		u.vadd(tmp, u);
		bodyA.angularVelocity.cross(ri, tmp);
		u.vsub(tmp, u);

		// apply the gravitational force equation here instead of hookes law
		// F = - k * ( x - L ) - D * ( u )
		// r_unit.scale(-k * (rlen - l) - d * u.dot(r_unit), f);
		// F = G * m1 * m2 / r^2
		r_unit.scale(-(G * bodyA.mass * bodyB.mass * this.scale) / Math.pow(rlen, 2), f);

		// console.log(f);

		// Add forces to bodies
		bodyA.force.vsub(f, bodyA.force);
		bodyB.force.vadd(f, bodyB.force);

		// Angular force
		ri.cross(f, ri_x_f);
		rj.cross(f, rj_x_f);
		bodyA.torque.vsub(ri_x_f, bodyA.torque);
		bodyB.torque.vadd(rj_x_f, bodyB.torque);
	}
}

const applyForce_r = new Vec3();
const applyForce_r_unit = new Vec3();
const applyForce_u = new Vec3();
const applyForce_f = new Vec3();
const applyForce_worldAnchorA = new Vec3();
const applyForce_worldAnchorB = new Vec3();
const applyForce_ri = new Vec3();
const applyForce_rj = new Vec3();
const applyForce_ri_x_f = new Vec3();
const applyForce_rj_x_f = new Vec3();
const applyForce_tmp = new Vec3();
