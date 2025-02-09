import { FabricImage, IText } from 'fabric'
import { useEffect, useState } from 'react';
import Loader from '../loader';
import Swal from 'sweetalert2';
import mergeImages from "merge-images";
import nextConfig from '../../../../../../next.config.mjs';

import ImageHelper from '@/Helpers/ImageHelper';

export default function Tools({ configs, setConfigs, productId, canvas, setImage, setShowAlbum, setShowUploadFontForm, fonts, setShowDesignList }) {

	const [product, setProduct] = useState(null);
	const [expandTools, setExpandTools] = useState(false)
	const [expandImages, setExpandImages] = useState(false)
	const [importImageMenu, setImportImageMenu] = useState(false)

	useEffect(() => {
		console.log(configs)
		if (!product && productId) {
			async function fetchProduct() {
				try {
					const res = await fetch(nextConfig.API_END_POINT + '/products/' + productId)
					const data = await res.json()
					setProduct(data)
				} catch (e) {
					console.error(e)
				}
			}

			fetchProduct();
		}


	}, [productId]);

	function changeTextColor(e) {
		let color = e.target.value;
		let objects = canvas.getActiveObjects();
		objects.forEach((object) => {
			object.set('fill', color);
		});
		canvas.renderAll();
	}

	function setTextToBold() {
		let objects = canvas.getActiveObjects();
		objects.forEach((object) => {
			object.set('fontWeight', object.fontWeight === 'bold' ? 'normal' : 'bold');
		});
		canvas.renderAll();
	}

	function createBlob(dataURL) {
		var BASE64_MARKER = ';base64,';
		if (dataURL.indexOf(BASE64_MARKER) == -1) {
		  var parts = dataURL.split(',');
		  var contentType = parts[0].split(':')[1];
		  var raw = decodeURIComponent(parts[1]);
		  return new Blob([raw], { type: contentType });
		}
		var parts = dataURL.split(BASE64_MARKER);
		var contentType = parts[0].split(':')[1];
		var raw = window.atob(parts[1]);
		var rawLength = raw.length;
	  
		var uInt8Array = new Uint8Array(rawLength);
	  
		for (var i = 0; i < rawLength; ++i) {
		  uInt8Array[i] = raw.charCodeAt(i);
		}
	  
		return new Blob([uInt8Array], { type: contentType });
	  }

	async function saveDesign(e) {

		let canvasdata = JSON.stringify(canvas.toJSON())
		const { value: formValues } = await Swal.fire({
			title: "Design Name",
			html: `<input placeholder="design name" id="name" class="swal2-input">`,
			focusConfirm: false,
			preConfirm: () => {
				return [
					document.getElementById("name").value,
				];
			}
		});
		if (formValues) {
			let name = formValues[0]

			let data = new FormData
			let file = new File([createBlob(canvas.toDataURL({format : 'png'}))], 'image.png', {
				type : 'image/png'
			})
			data.append('name', name)
			data.append('data', canvasdata)
			data.append('image', file)

			fetch(nextConfig.API_END_POINT + '/designs/create', {
				body : data,
				method : 'post'
			}).then(res => res.json())
			.then(js => alert(js))
		}

	}

	function setTextToItalic() {
		let objects = canvas.getActiveObjects();
		objects.forEach((object) => {
			object.set('fontStyle', object.fontStyle === 'italic' ? 'normal' : 'italic');
		});
		canvas.renderAll();
	}

	function setTextToUnderline() {
		let objects = canvas.getActiveObjects();
		objects.forEach((object) => {
			object.set('underline', !object.underline);
		});
		canvas.renderAll();
	}

	function setTextTostrikethrough() {
		let objects = canvas.getActiveObjects();
		objects.forEach((object) => {
			object.set('linethrough', !object.linethrough);
		});
		canvas.renderAll();
	}

	function setTextFontFamily(e) {
		let font = e.target.value;
		let objects = canvas.getActiveObjects();
		objects.forEach((object) => {
			object.set('fontFamily', font);
		});
		canvas.renderAll();
	}

	function downloadImage() {
		let board = ImageHelper.createBoard(
			configs.default.image_size.width,
			configs.default.image_size.height
		)

		let ctx = board.getContext('2d')

		let img = document.getElementById('bgimage')
		img.crossOrigin = 'anonymous'
		let canvas_image = new Image()
		canvas_image.crossOrigin = 'anonymous'
		canvas_image.src = canvas.toDataURL({
			format : 'png'
		})

		ctx.drawImage(
			img,
			0, 0,
			configs.default.image_size.width,
			configs.default.image_size.height 
		)

		ctx.drawImage(
			canvas_image,
			(configs.default.image_size.width / 2) - (canvas.get('width') / 2),
			(configs.default.image_size.height / 2) - (canvas.get('height') / 2)
		)



		ImageHelper.downloadImage(board.toDataURL('png'), 'png', 'abdou')
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

		link.href = canvas.toDataURL({ format: 'png'});
		link.download = 'download.png';
		link.style.display = 'none';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
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

	function changeCanvasDimensions(e) {

		let [w, h] = [Number(document.getElementById('canvasWidth').value), Number(document.getElementById('canvasHeight').value)]
		if(w < 100 ||h < 100){
			return
		}
		canvas.setWidth(w)
		canvas.setHeight(h)
		canvas.renderAll()

	}

	return (
		<div className={"border h-screen overflow-auto h-full rounded-r px-2 py-4 duration-300 ease-in-out flex flex-col space-y-3 " + (expandTools ? 'w-16' : 'w-72')}>
			<div className="header w-full flex justify-between items-center">
				{!expandTools && <div className="flex space-x-2 items-center">
					<i className="bi bi-tools text-xl text-slate-600"></i>
					<span className="text-slate-600 capitalize font-semibold tracking-wide">
						designer tools
					</span>
				</div>}
				<i onClick={() => setExpandTools(!expandTools)}
					className={"bi  justify-self-center bi-list h-8 w-8 text-center leading-7 float-right text-2xl text-slate-400 border rounded border-slate-300 cursor-pointer " + (expandTools ? 'mx-auto' : '')}></i>
			</div>


			{!expandTools && <div className="tools space-y-2 ">

				<div className="w-full rounded-md p-2 bg-gray-100 space-y-3">
					<div className="w-full flex justify-between items-center space-x-2">
						<div className="flex items-center space-x-2">
							<i className="bi bi-image text-slate-400 text-sm"></i>
							<span className="capitalize text-slate-500 font-semibold text-sm">
								images
							</span>
						</div>

						<span
							onClick={() => setExpandImages(!expandImages)}
							/* x-text="expanded? 'reset' : 'expand'" */
							className="float-right p-1 rounded text-sky-500 bg-slate-200 text-xs cursor-pointer">
							{expandImages ? 'reset' : 'expand'}
						</span>
					</div>

					<div className={"w-full space-x-1 p-1 flex " + (expandImages ? 'justify-center gap-2 flex-wrap' : 'flex-1 whitespace-nowrap overflow-auto')}>
						
						{product ? (
											product.data.images.map((image, index) => (
												<div onClick={(e) => selectImage(e, index)} key={index} className={"image w-14 h-14 bg-slate-600 rounded overflow-hidden " + (!expandImages ? 'shrink-0' : '')}>
													<img src={image.original_url} alt={image.name} className="w-full h-full pointer-events-none object-cover" />
												</div>
											))
						
										) : <Loader />}
					</div>
				</div>

				<div className="w-full rounded-md p-2 bg-gray-100">
					<div className="w-full flex justify-between items-center space-x-2">
						<div className="flex items-center space-x-2">
							<i className="bi bi-textarea-t text-slate-400 text-md"></i>
							<span className="capitalize text-slate-500 font-semibold text-sm">
								text tools
							</span>
						</div>

						<span
							/* @click="expanded = ! expanded" */
							/*  x-text="expanded? 'reset' : 'expand'"  */
							className="float-right p-1 rounded text-sky-500 bg-slate-200 text-xs cursor-pointer">
							expand
						</span>
					</div>

					<div className="w-full p-1 flex flex-col space-y-2 items-center">

						<div className="w-full p-1 flex flex-col space-y-2 m-0">
							<span className="text-slate-600 capitalize text-xs font-semibold">
								font styles :
							</span>

							<div className="w-full flex justify-center gap-2 flex-wrap">
								<button
									onMouseEnter={(e) => e.target.lastChild.classList.remove('hidden')}
									onMouseLeave={(e) => e.target.lastChild.classList.add('hidden')}
									onClick={(e) => setTextToBold()}
									data-style="bold"
									className="w-6 h-6 bg-white relative rounded shadow flex items-center justify-center">
									<i className="pointer-events-none bi bi-type-bold text-lg text-slate-600"></i>
									<div className="hidden absolute rounded -top-full left-full w-auto p-1 bg-black/50 text-white text-sm font-semibold">
										bold
									</div>
								</button>

								<button

									onMouseEnter={(e) => e.target.lastChild.classList.remove('hidden')}
									onMouseLeave={(e) => e.target.lastChild.classList.add('hidden')}
									data-style="italic"
									onClick={(e) => setTextToItalic()}
									className="w-6 h-6 bg-white relative rounded shadow flex items-center justify-center">
									<i className="pointer-events-none bi bi-type-italic text-lg text-slate-600"></i>
									<div className="hidden absolute rounded -top-full left-full w-auto p-1 bg-black/50 text-white text-sm font-semibold">
										italic
									</div>
								</button>

								<button

									onMouseEnter={(e) => e.target.lastChild.classList.remove('hidden')}
									onMouseLeave={(e) => e.target.lastChild.classList.add('hidden')}
									data-style="linethrough"
									onClick={(e) => setTextTostrikethrough()}
									className="w-6 h-6 bg-white relative rounded shadow flex items-center justify-center">
									<i className="pointer-events-none bi bi-type-strikethrough text-lg text-slate-600"></i>
									<div className="hidden absolute rounded -top-full left-full w-auto p-1 bg-black/50 text-white text-sm font-semibold">
										linethrough
									</div>
								</button>

								<button

									onMouseEnter={(e) => e.target.lastChild.classList.remove('hidden')}
									onMouseLeave={(e) => e.target.lastChild.classList.add('hidden')}
									data-style="underline"
									onClick={(e) => setTextToUnderline()}
									className="w-6 h-6 bg-white relative rounded shadow flex items-center justify-center">
									<i className="pointer-events-none bi bi-type-underline text-lg text-slate-600"></i>
									<div className="hidden absolute rounded -top-full left-full w-auto p-1 bg-black/50 text-white text-sm font-semibold">
										underline
									</div>
								</button>
							</div>
						</div>

						<div className="w-full p-1 flex flex-col space-y-2 m-0">
							<span className="text-slate-600 capitalize text-xs font-semibold">
								text styles :
							</span>

							<div className="flex gap-2 justify-around w-full items-center">

								<div className="bg-white shadow p-2 flex flex-col space-y-1">
									<span className="text-xs font-bold text-slate-600">
										text color
									</span>
									<div className="w-fill border-t border-gray-200 pt-1 flex space-x-1 items-center">
										<input onChange={(e) => changeTextColor(e)} type="color" className="w-5 h-5" />
										<span className="text-slate-500 text-xs font-bold">
											#f5f5f5
										</span>
									</div>
								</div>


								<div className="bg-white shadow p-2 flex flex-col flex-1 space-y-1">
									<div className="flex justify-between items-center">
										<span className="text-xs font-bold text-slate-600">
											font family
										</span>

										<i onClick={() => setShowUploadFontForm(true)} className="bi bi-plus text-lg cursor-pointer hover:shadow w-4 h-4 flex justify-center items-center rounded"></i>
									</div>
									<div className="w-fill border-t border-gray-200 pt-1 flex space-x-1 items-center">
										<select key={1} onChange={(e) => setTextFontFamily(e)} id="fontFamily" className="text-xs font-bold text-slate-600 outline-none border-none">
											<option key={2} value="" defaultValue={""} disabled>select font family</option>
											<option key={3} value="arial">Arial</option>
											<option key={4} value="times new roman">times new roman</option>
											<option key={5} value="cursive">cursive</option>
											{fonts ? fonts.map(font => <option key={Math.ceil(Math.random() * 100)} value={font.name}>{font.name}</option>) : ''}
										</select>
									</div>
								</div>


							</div>
						</div>
					</div>
				</div>



				<div className="w-full rounded-md p-2 bg-gray-100">
					<div className="w-full flex justify-between items-center space-x-2">
						<div className="flex items-center space-x-2">
							<i className="bi bi-bounding-box-circles text-slate-400 text-md"></i>
							<span className="capitalize text-slate-500 font-semibold text-sm">
								board dimensions
							</span>
						</div>

						<span
							/*  @click="expanded = ! expanded" */
							/* x-text="expanded? 'reset' : 'expand'"  */
							className="float-right p-1 rounded text-sky-500 bg-slate-200 text-xs cursor-pointer">
							expand
						</span>
					</div>

					<div className="w-full p-1 flex flex-col space-y-2 items-center">
						<div className="flex gap-2 justify-around w-full items-center">

							<div className="bg-white w-1/2 shadow p-2 flex flex-col space-y-1">
								<span className="text-xs font-bold text-slate-600">
									width
								</span>
								<div className="w-full border-t border-gray-200 pt-1 flex space-x-1 items-center">
									<input id='canvasWidth' onInput={(e) => changeCanvasDimensions(e)} defaultValue={configs.default.canvas.width} type="number" className="w-full border-b border-l h-6 px-2 focus:outline-none  text-xs font-semibold" />
								</div>
							</div>


							<div className="bg-white w-1/2 shadow p-2 flex flex-col space-y-1">
								<span className="text-xs font-bold text-slate-600">
									height
								</span>
								<div className="w-full border-t border-gray-200 pt-1 flex space-x-1 items-center">
									<input id='canvasHeight' onInput={(e) => changeCanvasDimensions(e)} defaultValue={configs.default.canvas.height} type="number" className="border-b border-l h-6 px-2 focus:outline-none  text-xs font-semibold w-full" />
								</div>
							</div>


						</div>
					</div>
				</div>





				<div className="w-full rounded-md p-2 bg-gray-100 shadow-md">
					<div className="w-full flex justify-between items-center space-x-2">
						<div className="flex items-center space-x-2">
							<i className="bi bi-boxes text-slate-400 text-md"></i>
							<span className="capitalize text-slate-500 font-semibold text-sm">
								controlling resource
							</span>
						</div>

						<span
							/* @click="expanded = ! expanded"
							x-text="expanded? 'reset' : 'expand'"  */
							className="float-right p-1 rounded text-sky-500 bg-slate-200 text-xs cursor-pointer">
							expand
						</span>
					</div>

					<div className="w-full flex flex-wrap gap-2 mt-2 relative">
					{importImageMenu && <div className="absolute -top-full bg-white shadow-lg p-2 rounded flex flex-col space-y-1">
							<button onClick={(e) => e.target.nextSibling.click()} className="w-full text-slate-600 flex items-center space-x-1">
								<i className=" pointer-events-none bi bi-file-earmark-image"></i>
								<span className=" pointer-events-none text-xs font-bold">
									from device
								</span>
							</button>

							<input type='file' onChange={(e) => addImage(e)} className='hidden' />

							<button onClick={() => setShowAlbum(true)} className="w-full text-slate-600 flex items-center space-x-1">
								<i className="bi bi-images"></i>
								<span className="text-xs font-bold">
									from album
								</span>
							</button>
						</div>}

						<button
							onClick={() => setImportImageMenu(!importImageMenu)}
							className="flex items-center justify-center w-fit py-1 px-2 rounded 
                                bg-white hover:bg-slate-200 shadow space-x-1 text-slate-600">


							<i className="bi bi-card-image"></i>
							<span className="text-xs font-bold uppercase ">
								import image
							</span>
						</button>

						<button
							onClick={() => addText('start editing!')}
							className="flex items-center justify-center w-fit py-1 px-2 rounded 
                                bg-white hover:bg-slate-200 shadow space-x-1 text-slate-600">
							<i className="bi bi-plus-square-dotted"></i>
							<span className="text-xs font-bold uppercase ">
								add text
							</span>
						</button>


						<button
							onClick={() => setShowDesignList(true)}
							className="flex items-center justify-center w-fit py-1 px-2 rounded 
                                bg-white hover:bg-slate-200 shadow space-x-1 text-slate-600">
							<i className="bi bi-easel"></i>
							<span className="text-xs font-bold uppercase ">
								import design
							</span>
						</button>
					</div>
				</div>

				<div className="w-full flex gap-2 flex-wrap justify-center items-center border-t border-sky-500 pt-4 mt-4">
					<button
						onClick={() => downloadDesign()}
						className="flex items-center justify-center w-fit py-1 px-2 rounded 
                                bg-slate-500 text-white hover:bg-slate-700 shadow space-x-1 text-slate-600">
						<i className="bi text-white bi-plus-square-dotted"></i>
						<span className="text-xs text-white font-bold uppercase">
							download design
						</span>
					</button>

					<button
						onClick={() => downloadImage()}
						className="flex items-center justify-center w-fit py-1 px-2 rounded 
                                bg-slate-500 text-white hover:bg-slate-700 shadow space-x-1 text-slate-600">
						<i className="bi text-white bi-plus-square-dotted"></i>
						<span className="text-xs text-white font-bold uppercase">
							download full image
						</span>
					</button>
				</div>
			</div>}

		</div>
	);
}
