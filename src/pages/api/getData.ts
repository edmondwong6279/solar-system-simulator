import { NextApiRequest, NextApiResponse } from 'next';

const dataVelocity = [47900, 35000, 29800, 24100, 13100, 9700, 6800, 5400, 0];

const dataDistance = [
	57900000, 108200000, 149600000, 228000000, 778500000, 1432000000, 2867000000, 4515000000, 0,
];

const dataDiameter = [4879, 12104, 12756, 6792, 142984, 120536, 51118, 49528, 1392700];

const dataMass = [0.33, 4.87, 5.97, 0.642, 1898, 568, 86.8, 102, 1989000];

const dataNames = [
	'mercury',
	'venus',
	'earth',
	'mars',
	'jupiter',
	'saturn',
	'uranus',
	'neptune',
	'sun',
];

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
	res.send(
		JSON.stringify({
			names: dataNames,
			distance: dataDistance,
			mass: dataMass,
			diameter: dataDiameter,
			velocity: dataVelocity,
		})
	);
};

export default handler;
