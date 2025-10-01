"use client";

import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sneaker } from "@/app/types/Sneaker";
import CreateEditForm from "@/components/CreateEditForm";

const Edit = ({ params }: { params: any }) => {
	const id = params.id;

	const [name, setName] = useState("");
	const [data, setData] = useState<Sneaker | undefined>(undefined);
	const [isLoading, setIsLoading] = useState(true);
	const supabase = createClient();
	const router = useRouter();

	useEffect(() => {
		const fetchSneaker = async () => {
			setIsLoading(true);
			const { data, error } = await supabase
				.from("sneakers")
				.select(`*, rating_id(*, vote(*)), images(*),brand_id(*)`)
				.eq("id", id)
				.single();

			if (error) {
				console.error("Error fetching sneaker:", error);
				// Navigate back if error occurs
				router.push("/dashboard");
			}

			if (data) {
				setName(data.name);
				setData(data);
			}

			setIsLoading(false);
		};

		fetchSneaker();
	}, [id, router, supabase]);

	if (isLoading) {
		return (
			<div className='max-w-3xl mx-auto p-10'>
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
					<div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
					<div className="space-y-4">
						<div className="h-12 bg-gray-200 rounded"></div>
						<div className="h-12 bg-gray-200 rounded"></div>
						<div className="h-12 bg-gray-200 rounded"></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-3xl mx-auto p-10'>
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">
					{`Edit ${name}`}
				</h1>
				<p className="text-gray-600 mt-2">Update your sizing journal entry</p>
			</div>

			<CreateEditForm
				sneaker={data}
				main={data?.main_image}
				id={id}
				all_images={data?.images}
			/>
		</div>
	);
};

export default Edit;
