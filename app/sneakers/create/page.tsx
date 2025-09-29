import CreateEditForm from "@/components/CreateEditForm";
import React from "react";

type Props = {};

export default function Create({}: Props) {
	return (
		<div className='max-w-3xl mx-auto p-10'>
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Create New Sneaker Entry</h1>
				<p className="text-gray-600 mt-2">Add a new sneaker to your sizing journal</p>
			</div>

			<CreateEditForm sneaker={undefined} main={undefined} id={0} all_images={undefined} />
		</div>
	);
}
