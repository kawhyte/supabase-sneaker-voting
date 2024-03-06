import { useState } from "react";
import supabase from "../config/supabaseClient";
import { useNavigate } from "react-router-dom";

const Create = () => {
	const navigate = useNavigate();

	const [name, setName] = useState("");
	const [brand, setBrand] = useState("");
	const [price, setPrice] = useState("");
	const [formError, setFormError] = useState(null);
	const [main_image, setImage] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();

		console.log ("handleSubmit ", e)

		if (!name || !brand || !main_image) {
			setFormError("Please fill in all the fields correctly.");
			return;
		}
		console.log("Name:",name,"Brand:", brand,"Price:",price,"main Image:", main_image);
		// const { data, error } = await supabase
		// 	.from("sneakers")
		// 	.insert([
		// 		{ name: name, brand: brand, price: price, main_image: main_image },
		// 	])
		// 	.select();

		if (error) {
			console.log(error);
			setFormError("Please fill in all the fields correctly.");
		}
		if (data) {
			console.log(data);
			setFormError(null);
			navigate("/");
		}
	};

	return (
		<div className='page create'>
			<h2>Create</h2>

			<form onSubmit={handleSubmit}>
				<div>
					<img src={main_image} alt='Sneaker' />
				</div>
				<label htmlFor='img'> Image Link:</label>
				<input
					type='text'
					id='img'
					value={main_image}
					onChange={(e) => setImage(e.target.value)}
				/>
				<label htmlFor='title'>Name:</label>
				<input
					type='text'
					id='title'
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>

				<label htmlFor='method'>Brand:</label>
				<textarea
					id='method'
					value={brand}
					onChange={(e) => setBrand(e.target.value)}
				/>

				<label htmlFor='rating'>Price:</label>
				<input
					type='number'
					id='rating'
					value={price}
					onChange={(e) => setPrice(e.target.value)}
				/>

				<button>Create Sneaker Listing</button>

				{formError && <p className='error'>{formError}</p>}
			</form>
		</div>
	);
};

export default Create;
