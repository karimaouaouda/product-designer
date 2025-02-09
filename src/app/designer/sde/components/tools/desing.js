import { FabricImage, IText } from 'fabric'
import { useEffect, useState } from 'react';
import Loader from '../loader';
import Swal from 'sweetalert2';
import mergeImages from "merge-images";
import nextConfig from '../../../../../../next.config.mjs';

import ImageHelper from '@/Helpers/ImageHelper';

export default function Tools({ configs, setConfigs, productId, canvas, setImage, setShowAlbum }) {

	const [product, setProduct] = useState(null);

	useEffect(() => {
		console.log(configs)
		if (!product && productId) {
			async function fetchProduct() {
				try{
					const res = await fetch(nextConfig.API_END_POINT + '/products/' + productId)
					const data = await res.json()
					setProduct(data)
				}catch(e){
					console.error(e)
				}
			}

			fetchProduct();
		}


	}, [productId]);

	function b64tob(b64){
		const byteCharacters = atob(b64);
		const byteArrays = [];

		for (let i = 0; i < byteCharacters.length; i++) {
			byteArrays.push(byteCharacters.charCodeAt(i));
		}

		const byteArray = new Uint8Array(byteArrays);
		return byteArray;
	}

	function downloadImage(){
		let src = ImageHelper.mergeImages([
			{
				src : document.getElementById('bgimage'),
				width : configs.default.image_size.width,
				height: configs.default.image_size.height,
				x : 0,
				y: 0
			},
			{
				src : canvas.toDataURL({format : 'png'}),
				x : (configs.default.image_size.width / 2) - (canvas.get('width') / 2),
				y : (configs.default.image_size.height / 2) - (canvas.get('height') / 2)
			},
		])

		ImageHelper.downloadImage(src, 'png', 'abdou')
	}

	const addText = (text) => {
		canvas.add(new IText(text));
	}

	function isFileImage(file) {
		return file && file['type'].split('/')[0] === 'image';
	}

	function addImage(e) {
		let inpt = e.target
		if (inpt.value) {
			let file = inpt.files[0]
			if (!isFileImage(file)) {
				Swal.fire({
					icon: 'error',
					text: 'you must chose an image',
					title: 'bad behaviour',
				})
			}

			var reader = new FileReader();
			reader.onload = function (e) {
				console.log(e.target.result)
				FabricImage.fromURL(e.target.result)
					.then(function (img) {
						canvas.add(img)
						if (img.get('width') > canvas.get('width') / 2) img.scaleToWidth(canvas.get('width') / 2);
						canvas.setActiveObject(img);
						canvas.renderAll();

					}).catch(e => console.log(e))
			}
			reader.readAsDataURL(file);


		}
	}

	function downloadDesign(e) {
		var link = document.createElement('a');
		var canvas_exportwidth = 1000;
		var canvas_review_width = 250;

		link.href = canvas.toDataURL({ format: 'png', multiplier: Math.ceil(10000 / (canvas_exportwidth / canvas_review_width)) / 10000 });
		link.download = 'download.png';
		link.style.display = 'none';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		e.preventDefault();
	}

	function selectImage(e, index) {

		let imdata = product.data.images[index]
		let i = new Image(
			configs.default.image_size.width,
			configs.default.image_size.height
		)

		i.width = configs.default.image_size.width
		i.height = configs.default.image_size.height
		i.crossOrigin = 'anonymous'
		i.src = imdata.original_url

		console.log(i)
		FabricImage.fromObject(i).then((img) => {
			setImage({
				index: index,
				image: img,
				src: imdata.original_url
			})
		})

		e.target.classList.toggle('border-sky-800');
		e.target.classList.toggle('border-4');
	}

	function toBase64(img) {
		return new Promise((resolve, reject) => {
			// Create a canvas to draw the image
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			// Set canvas dimensions to match the image
			canvas.width = img.width;
			canvas.height = img.height;

			// Draw the image on the canvas
			ctx.drawImage(img, 0, 0);

			// Get the base64 string of the image
			const base64Data = canvas.toDataURL('image/png'); // You can use 'image/jpeg' or other formats

			// Extract the base64 part (remove the data:image/png;base64, part)
			const base64Binary = base64Data.split(',')[1];

			resolve(base64Binary);
		});
	}

	function changeCanvasDimensions(e){

		let [w, h] = [Number(document.getElementById('canvasWidth').value), Number(document.getElementById('canvasHeight').value)]
		canvas.setWidth(w)
		canvas.setHeight(h)
		canvas.renderAll()
		
	}

	return (
		<div className="tools w-full py-4  border h-auto lg:h-screen  flex flex-col items-center">
			<h2 className="text-left w-full px-4">
				Types :
			</h2>
			<div className="px-4 w-full flex gap-3 justify-around items-center">
				{product ? (
					product.data.images.map((image, index) => (
						<div onClick={(e) => selectImage(e, index)} key={index} className="flex  w-20 h-20 rounded-full overflow-hidden justify-between items-center border-b border-gray-300">
							<img src={image.original_url} alt={image.name} className="w-full h-full pointer-events-none object-cover" />
						</div>
					))

				) : <Loader />}
			</div>

			<div className="buttons lg:space-y-3 flex justify-around lg:flex-col items-center w-full mt-10">
				<button onClick={(e) => document.getElementById('addImage').click()} className="px-2 py-1 border rounded border-sky-800 hover:bg-slate-100 duration-200 shadow-md ease-in-out">
					<i className="bi bi-card-image"></i> Add Image
				</button>
				<input onChange={addImage} type="file" id='addImage' className="hidden"></input>

				<button onClick={(e) => addText('new text')} className="px-2 py-1 border rounded border-sky-800 hover:bg-slate-100 duration-200 shadow-md ease-in-out">
					<i className="bi bi-fonts"></i> Add Text
				</button>

				<button onClick={() => setShowAlbum(true)} className="px-2 py-1 border rounded border-sky-800 hover:bg-slate-100 duration-200 shadow-md ease-in-out">
					<i className="bi bi-file-earmark-image"></i> Album
				</button>

				<button onClick={downloadDesign} className="px-2 py-1 border rounded border-sky-800 hover:bg-slate-100 duration-200 shadow-md ease-in-out">
					<i className="bi bi-file-earmark-image"></i> download design
				</button>

				<button onClick={downloadImage} className="px-2 py-1 border rounded border-sky-800 hover:bg-slate-100 duration-200 shadow-md ease-in-out">
					<i className="bi bi-file-earmark-image"></i> download image
				</button>

			</div>

			<div className='w-full flex flex-col items-center justify-center gap-2 mt-4'>
				<h2 className='text-md font-semibold underline text-center'>control canvas dimenstions</h2>

				<div className='w-full flex justify-center gap-2'>
					<input id='canvasWidth' placeholder='width' defaultValue={configs.default.canvas.width} className='px-2 py-1 rounded w-1/3 focus:border-sky-700 outline-none border' />
					<input id='canvasHeight' placeholder='height' defaultValue={configs.default.canvas.height} className='px-2 py-1 rounded w-1/3 focus:border-sky-700 outline-none border' />
				</div>
				<button className='px-2 py-1 rounded border border-sky-500 shadow' onClick={changeCanvasDimensions}>
					change dimenstion
				</button>
			</div>
		</div>
	);
}
