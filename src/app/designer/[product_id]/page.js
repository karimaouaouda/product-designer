'use client'
import NextImage from "next/image";
import Tools from "./components/tools/desing";
import TextTools from "./components/texttools/design";
import Board from "./components/canvas/design";
import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, FabricImage } from 'fabric'
import Swal from "sweetalert2";
import Loader from "./components/loader";
import Loading from "./loading";

export default  function Home({params}) {
  
  const canvasEl = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [selected, setSelected] = useState([]);
  const [image, setImage] = useState(null);
  const [productId, setProductId] = useState(null);



  const conf = {
    default : {
      image_size : {
        width : 500,
        height : 500
      },
      canvas : {
        width : 300,
        height : 300
      }
    }
  }

  const [configs, setConfigs] = useState(conf);
  const [showAlbum, setShowAlbum] = useState(false);
  const [showUploadImageForm, setShowUploadImageForm] = useState(false);
  const [album, setAlbum] = useState(null);
  const [showUploadFontForm, setShowUploadFontForm] = useState(false)
  
  useEffect(() => {

    if(!productId){
      
      async function getPID(){
        let id = (await params).product_id
        setProductId(id)
        return id
      }

      getPID()

    }

    if(!album){
      async function fetchAlbum() {
        const res = await fetch('http://store.test/api/albums/1')
        const data = await res.json()
        setAlbum(data)
      }
      fetchAlbum()
    }

    if(!canvas){
      setCanvas(new Canvas(canvasEl.current, {
        preserveObjectStacking: true,
        zoomEnabled: true,
        width : configs.default.canvas.width,
        height : configs.default.canvas.height
      }));
    }

    if(canvas){
      return () => {
        canvas.dispose();
      }
    }
  }, [canvas, configs]);

  function uploadImage(e){
    let name = document.getElementById('name').value;
    let image = document.getElementById('image').files[0];

    const formData = new FormData();

    formData.append('name', name);
    formData.append('image', image);

    fetch('http://store.test/api/albums/1/push-picture', {
      method: 'POST',
      body: formData
    }).then((res) => {
      Swal.fire({
        title: 'Image Uploaded',
        icon: 'success',
        timer: 2000
      });
      setShowUploadImageForm(false);

      //add the new wimage to the container
    })
  }

  function uploadFont(e){
    let name = document.getElementById('font_name').value;
    let font = document.getElementById('font_file').files[0];

    const formData = new FormData();

    formData.append('name', name);
    formData.append('font', font);

    fetch('http://store.test/api/fonts/create', {
      method: 'POST',
      body: formData
    }).then((res) => {
      Swal.fire({
        title: 'font Uploaded',
        icon: 'success',
        timer: 2000
      });
      setShowUploadImageForm(false);
    });
  }

  function addImage(e){
    let image = e.target
    FabricImage.fromObject(image)
      .then(function(img){
        canvas.add(img)
        if (img.get('width') > canvas.get('width') / 2) img.scaleToWidth(canvas.get('width') / 2);
						canvas.setActiveObject(img);
						canvas.renderAll();
      })
  }


  return (
      <div className="w-full grid grid-cols-1 lg:grid-cols-4 relative">
        <Suspense fallback={<Loading/>}>
          <Tools configs={configs} setConfigs={setConfigs} productId={productId} canvas={canvas} setImage={setImage} setShowAlbum={setShowAlbum}/>
        </Suspense>
        
        <Board configs={configs} canvas={canvas} setCanvas={setCanvas} canvasEl={canvasEl} image={image}/>
        <TextTools canvas={canvas} setShowUploadFontForm={setShowUploadFontForm} />

        {showAlbum && <div className="absolute  top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 max-h-[80vh] rounded-lg w-full max-w-6xl flex flex-col">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <i className="bi bi-image text-xl"></i>
                <h2 className="text-slate-800 font-bold tracking-wide uppercase text-xl">Album</h2>
              </div>

              <i onClick={() => setShowAlbum(false)} className="bi bi-x-lg text-xl w-8 h-8 flex justify-center items-center border shadow-sm rounded hover:bg-red-300 duration-300 ease-in-out cursor-pointer"></i>
            </div>

            <div className="border w-full mt-4 gap-2 flex justify-center p-2 flex-wrap max-h-[80%] overflow-auto">
              
              {album ? album.data.images.map((image, index) => (
                <div key={index} className="relative w-40 h-40 rounded shadow-sm border hover:scale-105 duration-300 ease-in-out cursor-pointer">
                  <NextImage onClick={addImage} crossOrigin="anonymous" sizes="200px" src={image.url} alt={image.name} layout="fill" objectFit="cover"/>
                </div>
              )) : <Loader/>}
            </div>

            <div className="w-full flex justify-end mt-4">
              <button onClick={() => setShowUploadImageForm(true)} className="px-4 py-2 border rounded border-sky-800 hover:bg-slate-100 duration-200 shadow-md ease-in-out">
                <i className="bi bi-plus-lg text-xl"></i>
                <span>
                  Add Image
                </span>
              </button>
            </div>
          </div>
        </div>}

        {showUploadImageForm && <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-80 flex justify-center items-center">
          <div className="bg-white p-4 max-h-[80vh] rounded-lg w-full max-w-2xl flex flex-col">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                  <i className="bi bi-image text-xl"></i>
                  <h2 className="text-slate-800 font-bold tracking-wide uppercase text-xl">Add Image</h2>
              </div>

              <i onClick={() => setShowUploadImageForm(false)} className="bi bi-x-lg text-xl w-8 h-8 flex justify-center items-center border shadow-sm rounded hover:bg-red-300 duration-300 ease-in-out cursor-pointer"></i>
            </div>

            <form id="uploadImageForm" className="w-full flex flex-col gap-4">
              <div className="w-full flex flex-col gap-2">
                <label htmlFor="image" className="text-slate-800 font-bold">
                  Image
                </label>
                <input type="file" name="image" id="image" className="w-full border rounded p-2"/>
              </div>

              <div className="w-full flex flex-col gap-2">
                <label htmlFor="name" className="text-slate-800 font-bold">
                  Name
                </label>
                <input type="text" name="name" id="name" className="w-full border outline-none focus:border-sky-500 rounded p-2"/>
              </div>
            </form>

            <div className="w-full flex space-x-4 justify-end mt-4">
              <button onClick={() => setShowUploadImageForm(false)} className="px-4 py-2 flex items-center  space-x-2 border rounded border-white bg-red-300 hover:bg-red-400 duration-200 shadow-md ease-in-out">
                <i className="bi bi-x-lg text-white text-xl"></i>
                <span className="text-white text-xl">
                  cancel
                </span>
              </button>

              <button onClick={uploadImage} className="px-4  py-2 flex items-center  space-x-2 border rounded border-white bg-sky-500 hover:bg-sky-700 duration-200 shadow-md ease-in-out">
                <i className="bi bi-check-lg text-white text-xl"></i>
                <span className="text-white text-xl">
                  uplaod
                </span>
              </button>
            </div>
          </div>
        </div>}

        {showUploadFontForm && <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-80 flex justify-center items-center">
          <div className="bg-white p-4 max-h-[80vh] rounded-lg w-full max-w-2xl flex flex-col">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                  <i className="bi bi-image text-xl"></i>
                  <h2 className="text-slate-800 font-bold tracking-wide uppercase text-xl">Add Image</h2>
              </div>

              <i onClick={() => setShowUploadFontForm(false)} className="bi bi-x-lg text-xl w-8 h-8 flex justify-center items-center border shadow-sm rounded hover:bg-red-300 duration-300 ease-in-out cursor-pointer"></i>
            </div>

            <form id="uploadFontForm" className="w-full flex flex-col gap-4">
              <div className="w-full flex flex-col gap-2">
                <label htmlFor="image" className="text-slate-800 font-bold">
                  Font
                </label>
                <input type="file" name="font" id="font_file" className="w-full border rounded p-2"/>
              </div>

              <div className="w-full flex flex-col gap-2">
                <label htmlFor="name" className="text-slate-800 font-bold">
                  Name
                </label>
                <input type="text" name="font_name" id="font_name" className="w-full border outline-none focus:border-sky-500 rounded p-2"/>
              </div>
            </form>

            <div className="w-full flex space-x-4 justify-end mt-4">
              <button onClick={() => setShowUploadFontForm(false)} className="px-4 py-2 flex items-center  space-x-2 border rounded border-white bg-red-300 hover:bg-red-400 duration-200 shadow-md ease-in-out">
                <i className="bi bi-x-lg text-white text-xl"></i>
                <span className="text-white text-xl">
                  cancel
                </span>
              </button>

              <button onClick={uploadFont} className="px-4  py-2 flex items-center  space-x-2 border rounded border-white bg-sky-500 hover:bg-sky-700 duration-200 shadow-md ease-in-out">
                <i className="bi bi-check-lg text-white text-xl"></i>
                <span className="text-white text-xl">
                  uplaod
                </span>
              </button>
            </div>
          </div>
        </div>}

      </div>
  );
}
