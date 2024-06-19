import React from "react";

type Props = {};

export function UpdateData(setSneakers: any, setSneakerCount: any) {
	return (id: any) => {
		setSneakers((prevSmoothies: any) => {
			const updatedSneakers = prevSmoothies?.filter((sm: any) => sm.id !== id);
			setSneakerCount(updatedSneakers?.length);

			return updatedSneakers;
		});
	};
}

export function sneakerVote(
	supabase: any,
	sneaker: any,
	toast: any,
	setVote: any,
	refeshPage: any
) {
	return async (value: any, e: any) => {
		const { data: rating_data, error } = await supabase
			.from("rating")
			.insert([
				{
					vote: value,

					sneaker_id: sneaker.id,
				},
			])
			.select();

		if (error) {
			console.log(error);
		}

		if (rating_data) {
			const sneakerID = rating_data[0]?.id;
			const { data, error } = await supabase
				.from("sneakers")
				.update({ rating_id: sneakerID })
				.eq("id", sneaker.id)
				.select();
			//.order("name", { ascending: true });
			toast({
				description: "Horray! You successfully voted  ⚡️",
			});

			setVote(value);

			refeshPage(sneaker.id);
		}
	};
}
