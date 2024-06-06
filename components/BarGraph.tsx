"use client";

import React from "react";

import {
	BarChart,
	ResponsiveContainer,
	XAxis,
	YAxis,
	Bar,
} from "recharts";
type Props = {
	count: any;
};

export default function BarGraph({ count }: Props) {
	let sneakerData = Object.entries(count);
	return (
		<ResponsiveContainer width={"100%"} height={350}>
			<BarChart data={sneakerData}>
				<XAxis
					dataKey={"0"}
					tickLine={false}
					axisLine={false}
					stroke='#888888'
					fill='#8884d8'
					fontSize={12}
				/>
				<YAxis
					tickLine={false}
					axisLine={false}
					stroke='#888888'
					fontSize={12}
				/>

				<Bar dataKey={"1"} fill='#16a34a' radius={[4, 4, 0, 0]} />
			</BarChart>
		</ResponsiveContainer>
	);
}
