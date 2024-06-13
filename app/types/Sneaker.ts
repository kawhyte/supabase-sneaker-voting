export type Sneaker = {
	id: number;
	name: string;
	style: string;
	release_date: Date;
	price: number;
	main_image: string;
	brand_id: string;
	images: Array<{
		image_link: string;
		sneaker_id: string;
		main_image: boolean;
	}>;
};
