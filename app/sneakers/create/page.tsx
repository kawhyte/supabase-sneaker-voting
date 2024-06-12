import CreateForm from "@/components/CreateForm";
import SectionHeader from "@/components/SectionHeader";
import React from "react";

type Props = {};

export default function Create({}: Props) {
	return (
		<div className='max-w-3xl mx-auto p-10'>
			<SectionHeader
				name={"Create new"}
				total={undefined}
				sectiontext={"Sneaker Vote Count"}
			/>

			<CreateForm />
		</div>
	);
}
