'use client'
import {FabricText } from 'fabric'
import {useEffect, useState } from 'react';

export default function Board({configs, canvas, setCanvas, canvasEl, image}) {

	const [width, setWidth] = useState(500);
	const [height, setHeight] = useState(500);
	const [boardObjects, setBoardObjects] = useState([]);


	function pushObject(object){
		setBoardObjects([...boardObjects, object]);
	}

	function center(objects, direction){
		let center = canvas.getCenter();
		objects.forEach((object) => {
			if(direction === 'vertical'){
				object.set('top', center.top - object.height / 2).setCoords();
			}

			if(direction === 'horizental'){
				object.set('left', center.left - object.width / 2 ).setCoords();
			}

			if(direction === 'both'){
				object.set('top', center.top - object.height / 2).set('left', center.left - object.width / 2).setCoords();
			}
		});
		canvas.renderAll();
	}

	function move(direction){
		let objects = canvas.getActiveObjects();

		if(direction === 'vertical-center'){
			center(objects, 'vertical');
			return
		}

		if(direction === 'horizental-center'){
			center(objects, 'horizental');
			return
		}

		if(direction === 'center'){
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

	function horizentalFlip(){
		let objects = canvas.getActiveObjects();
		objects.forEach((object) => {
			object.set('flipX', !object.flipX).setCoords();
		});
		canvas.renderAll();
	}

	function verticalFlip(){
		let objects = canvas.getActiveObjects();
		objects.forEach((object) => {
			object.set('flipY', !object.flipY).setCoords();
		});
		canvas.renderAll();
	}

	function deleteObjects(){
		canvas.remove(...canvas.getActiveObjects());
	}

	function sendToFront(){
		let objects = canvas.getActiveObjects();
		objects.forEach((object) => {
			canvas.bringObjectToFront(object);
		});
	}

	function sendToBack(){
		let objects = canvas.getActiveObjects();
		objects.forEach((object) => {
			canvas.sendObjectToBack(object);
		});
	}

	function pushText(text){
		const t = new FabricText(text);
		canvas.add(t);
	}

	useEffect(() => {
	  }, [width, height, canvas]);


  return (
	
    <div className='w-full h-screen col-span-2 flex relative justify-center items-center'>
		{!image || (
			<div  className='w-full h-full absolute'>
				<img id={'bgimage'} width={configs.default.image_size.width ??'100%'} height={configs.default.image_size.height ??'100%'} src={image.src} alt='product' className='object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'/>
			</div>
		)}
		<div  className='absolute top-0 left-1/2 -translate-x-1/2 p-2  flex justify-center gap-2'>
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
		
		<canvas className='w-full h-full border border-2 border-gray-600 border-dashed' ref={canvasEl}/>
	</div>
  );
}

// design => (product, image, design_path, data, design_type, created_at, updated_at)
