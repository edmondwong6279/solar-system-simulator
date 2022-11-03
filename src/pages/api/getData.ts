/* eslint-disable no-console */
import * as fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
	console.log('Insider handler');
	console.log(process.cwd());
	console.log(__filename);

	// read line by line, process from these coords to xyz coords, push into an array
	fs.readFile('/public/data.csv', 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			return;
		}

		const processedMass: number[] = [];
		const processedDiamter: number[] = [];
		const processedDistance: number[] = [];
		const processedVelocity: number[] = [];
		const processedNames: string[] = [];
		const lines = data.split('\n');

		lines.forEach((line, idx) => {
			if (idx !== 0) {
				const current = line.split(',');
				const [name, mass, diameter, distance, velocity] = [
					current[0],
					Number(current[1]),
					Number(current[2]),
					Number(current[3]),
					Number(current[4]),
				];

				processedMass.push(mass);
				processedDiamter.push(diameter);
				processedDistance.push(distance);
				processedVelocity.push(velocity);
				processedNames.push(name);
			}
		});

		console.log(`Getting ${processedNames.length} bodies.`);
		res.send(
			JSON.stringify({
				names: processedNames,
				distance: processedDistance,
				mass: processedMass,
				diameter: processedDiamter,
				velocity: processedVelocity,
			})
		);
	});
};

export default handler;
