import React from 'react'

type Props = {}

export function UpdateData(setSneakers:any, setSneakerCount:any) {
	return (id: any) => {
		setSneakers((prevSmoothies: any) => {
			const updatedSneakers = prevSmoothies?.filter((sm: any) => sm.id !== id);
			setSneakerCount(updatedSneakers?.length);

			return updatedSneakers;
		});
	};
}