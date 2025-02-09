'use client'
import { FabricText } from 'fabric'
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import nextConfig from '../../../../../../next.config.mjs';

export default function Board({ configs, canvas, setCanvas, canvasEl, image }) {

	const [width, setWidth] = useState(500);
	const [height, setHeight] = useState(500);
	const [boardObjects, setBoardObjects] = useState([]);

	function center(objects, direction) {
		let center = canvas.getCenter();
		objects.forEach((object) => {
			if (direction === 'vertical') {
				object.set('top', center.top - object.height / 2).setCoords();
			}

			if (direction === 'horizental') {
				object.set('left', center.left - object.width / 2).setCoords();
			}

			if (direction === 'both') {
				object.set('top', center.top - object.height / 2).set('left', center.left - object.width / 2).setCoords();
			}
		});
		canvas.renderAll();
	}

	function move(direction) {
		let objects = canvas.getActiveObjects();

		if (direction === 'vertical-center') {
			center(objects, 'vertical');
			return
		}

		if (direction === 'horizental-center') {
			center(objects, 'horizental');
			return
		}

		if (direction === 'center') {
			center(objects, 'both');
			return
		}

		let step = direction === 'right' || direction === 'bottom' ? 1 : -1;
		console.log('step', step);
		direction = direction === 'right' ? 'left' : direction;
		direction = direction === 'bottom' ? 'top' : direction;
		objects.forEach((object) => {

			object.set(direction, object.get(direction) + step).setCoords();

			canvas.renderAll();
		});
	}

	function horizentalFlip() {
		let objects = canvas.getActiveObjects();
		objects.forEach((object) => {
			object.set('flipX', !object.flipX).setCoords();
		});
		canvas.renderAll();
	}

	function verticalFlip() {
		let objects = canvas.getActiveObjects();
		objects.forEach((object) => {
			object.set('flipY', !object.flipY).setCoords();
		});
		canvas.renderAll();
	}

	function deleteObjects() {
		canvas.remove(...canvas.getActiveObjects());
	}

	function sendToFront() {
		let objects = canvas.getActiveObjects();
		objects.forEach((object) => {
			canvas.bringObjectToFront(object);
		});
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

	function sendToBack() {
		let objects = canvas.getActiveObjects();
		objects.forEach((object) => {
			canvas.sendObjectToBack(object);
		});
	}

	async function saveDesign(e){
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
			.then(js => console.log(js))
		}
	}
	
	useEffect(() => {
	}, [width, height, canvas]);


	return (
		<div className="bg-slate-100 h-full flex-1 relative flex items-center justify-center">

			{!image || (
				<div className='w-full h-full absolute'>
					<img id={'bgimage'} width={configs.default.image_size.width ?? '100%'} height={configs.default.image_size.height ?? '100%'} src={image.src} alt='product' className='object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
				</div>
			)}
			<div className="absolute bottom-0 w-full flex justify-center py-4 gap-2">


				<button onClick={() => move('horizental-center')} className='w-10 h-10 shadow-md bg-slate-200 hover:bg-slate-100 duration-200 ease-in-out rounded'>
					<i className='bi bi-arrows text-3xl font-bold'></i>
				</button>

				<button onClick={() => move('vertical-center')} className='w-10 h-10 shadow-md bg-slate-200 hover:bg-slate-100 duration-200 ease-in-out rounded'>
					<i className='bi bi-arrows-vertical text-3xl font-bold'></i>
				</button>

				<button onClick={() => move('top')} className='w-10 h-10 shadow-md bg-slate-200 hover:bg-slate-100 duration-200 ease-in-out rounded'>
					<i className='bi bi-arrow-up-short text-3xl font-bold'></i>
				</button>

				<button onClick={() => move('right')} className='w-10 h-10 shadow-md bg-slate-200 hover:bg-slate-100 duration-200 ease-in-out rounded'>
					<i className='bi bi-arrow-right-short text-3xl font-bold'></i>
				</button>

				<button onClick={() => move('center')} className='w-10 h-10 shadow-md bg-slate-200 hover:bg-slate-100 duration-200 ease-in-out rounded'>
					<i className='bi bi-arrows-move text-3xl font-bold'></i>
				</button>

				<button onClick={() => move('bottom')} className='w-10  h-10 shadow-md bg-slate-200 hover:bg-slate-100 duration-200 ease-in-out rounded'>
					<i className='bi bi-arrow-down-short text-3xl font-bold'></i>
				</button>

				<button onClick={() => move('left')} className='w-10 h-10 shadow-md bg-slate-200 hover:bg-slate-100 duration-200 ease-in-out rounded'>
					<i className='bi bi-arrow-left-short text-3xl font-bold'></i>
				</button>

				<button onClick={() => verticalFlip()} className='w-10 h-10 shadow-md bg-slate-200 hover:bg-slate-100 duration-200 ease-in-out rounded'>
					<i className='bi bi-symmetry-horizontal text-3xl font-bold'></i>
				</button>

				<button onClick={() => horizentalFlip()} className='w-10 h-10 shadow-md bg-slate-200 hover:bg-slate-100 duration-200 ease-in-out rounded'>
					<i className='bi bi-symmetry-vertical text-3xl font-bold'></i>
				</button>

				<button onClick={() => deleteObjects()} className='w-10 h-10 text-red-500 shadow-md bg-slate-200 hover:bg-slate-100 duration-200 ease-in-out rounded'>
					<i className='bi bi-trash text-3xl font-bold'></i>
				</button>

				<button onClick={() => sendToFront()} className='w-10 h-10 shadow-md bg-slate-200 hover:bg-slate-100 duration-200 ease-in-out rounded'>
					<i className='bi bi-chevron-bar-down text-3xl font-bold'></i>
				</button>

				<button onClick={() => sendToBack()} className='w-10 h-10 shadow-md bg-slate-200 hover:bg-slate-100 duration-200 ease-in-out rounded'>
					<i className='bi bi-chevron-bar-up text-3xl font-bold'></i>
				</button>
			</div>

			<button onClick={(e) => saveDesign()} className='absolute bottom-4 right-4 px-2 py-1 flex items-center shadow-md bg-slate-200 hover:bg-slate-100 duration-200 ease-in-out rounded'>
				<i className='bi bi-check text-3xl font-bold'></i>
				<span>
					save design
				</span>
			</button>

			<canvas className='w-full h-full border border-2 border-gray-600 border-dashed' ref={canvasEl} />
		</div>
	);
}

// design => (product, image, design_path, data, design_type, created_at, updated_at)
