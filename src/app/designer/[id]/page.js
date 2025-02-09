'use client'
import NextImage from "next/image";
import Tools from "./components/tools/desing";
import Board from "./components/canvas/design";
import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, FabricImage } from 'fabric'
import Swal from "sweetalert2";
import Loader from "./components/loader";
import Loading from "./loading";
import nextConfig from "../../../../next.config.mjs";

export default  function Home({params}) {

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
  
  const canvasEl = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [image, setImage] = useState(null);
  const [productId, setProductId] = useState(null);
  const [configs, setConfigs] = useState(conf);
  const [showAlbum, setShowAlbum] = useState(false);
  const [showUploadImageForm, setShowUploadImageForm] = useState(false);
  const [album, setAlbum] = useState(null);
  const [showUploadFontForm, setShowUploadFontForm] = useState(false)
  const [fonts, setFonts] = useState(null)
  const [showDesignList, setShowDesignList] = useState(false)
  const [designs, setDesigns] = useState(null)
  
  useEffect(() => {
    if(!productId){
      
      async function getPID(){
        let id = (await params).id
        setProductId(id)
        return id
      }

      getPID()

    }

    if(!album){
      async function fetchAlbum() {
        const res = await fetch(nextConfig.API_END_POINT + '/albums/1')
        const data = await res.json()
        setAlbum(data)
      }
      fetchAlbum()
    }

    if(!canvas){
      setCanvas(new Canvas(canvasEl.current, {
        preserveObjectStacking: true,
        selectionBorderColor: 'yellow',
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

    if(!fonts){
      async function fetchFonts() {
        const res = await fetch(nextConfig.API_END_POINT + '/fonts/1')
        const data = await res.json()

        let fonts = []
        let set = new Set()

        data.data.forEach(item => {
          if (!set.has(item.name)) {
            set.add(item.name);
            fonts.push(item);
          }
        });

        console.log(fonts)
        

        setFonts(fonts)
      }
      fetchFonts()
    }
  }, [canvas, configs]);

  function removeDesign(index){
    Swal.fire({
      title : 'are u sure!',
      text : 'are u want to delete this design ?',
      icon : 'question',
      showConfirmButton : true,
      confirmButtonColor: 'red',
      confirmButtonText : 'delete',
      showCancelButton : true
    }).then(response => {
      if(response.isConfirmed){
        Swal.fire({
          title : 'deleted',
          text : 'design deleted successfully',
          icon : 'success'
        })
      }
    })
  }

  function uploadImage(e){
    let name = document.getElementById('name').value;
    let image = document.getElementById('image').files[0];

    const formData = new FormData();

    formData.append('name', name);
    formData.append('image', image);

    fetch(nextConfig.API_END_POINT + '/albums/1/push-picture', {
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
    }).catch(function(err){
      Swal.fire({
        title: 'Error',
        text: 'Something went wrong : ' + err.message,
        icon : 'error',
        timer : 3500
      })
    })
  }

  function uploadFont(e){
    let name = document.getElementById('font_name').value;
    let font = document.getElementById('font_file').files[0];
    let font_weight = document.getElementById('font_weight').value;
    let font_style = document.getElementById('font_style').value;

    const formData = new FormData();

    formData.append('name', name);
    formData.append('font', font);
    formData.append('font_weight', font_weight);
    formData.append('font_style', font_style);

    fetch(nextConfig.API_END_POINT + '/fonts/create', {
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

  async function importDesign(index){
		let design = designs[index]

    canvas.loadFromJSON(design.data)
      .then(canvas => canvas.requestRenderAll())

    setShowDesignList(false)
	}

  function showImportDesignsModal(show){
    if(!designs){
      fetch(nextConfig.API_END_POINT + '/1/designs')
        .then(res => res.json())
        .then(js => {
          setDesigns(js.data)
        })
        .catch(err => console.log(err))
    }

    setShowDesignList(true)
  }


  return (
      <div className="w-screen h-screen flex overflow-hidden relative">
        
        <Tools configs={configs} setConfigs={setConfigs} productId={productId} canvas={canvas} setImage={setImage} setShowAlbum={setShowAlbum} setShowUploadFontForm={setShowUploadFontForm} fonts={fonts} setShowDesignList={showImportDesignsModal}/>
        
        
        <Board configs={configs} canvas={canvas} setCanvas={setCanvas} canvasEl={canvasEl} image={image}/>

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

        {showDesignList && <div className="absolute  top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 max-h-[80vh] rounded-lg w-full max-w-6xl flex flex-col">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <i className="bi bi-image text-xl"></i>
                <h2 className="text-slate-800 font-bold tracking-wide uppercase text-xl">Design</h2>
              </div>

              <i onClick={() => setShowDesignList(false)} className="bi bi-x-lg text-xl w-8 h-8 flex justify-center items-center border shadow-sm rounded hover:bg-red-300 duration-300 ease-in-out cursor-pointer"></i>
            </div>

            <div className="border w-full mt-4 gap-2 flex justify-center p-2 flex-wrap max-h-[80%] overflow-auto">
              
              {designs ? designs.map((design, index) => (
                <div key={index} className="relative w-40 h-40 rounded shadow-sm border hover:scale-105 duration-300 ease-in-out cursor-pointer">
                  <NextImage onClick={() => importDesign(index)} data-index={index} crossOrigin="anonymous" sizes="200px" src={design.preview_url} alt={design.name} layout="fill" objectFit="cover"/>

                  <i className="bi bi-trash w-6 h-6 absolute top-2 right-2 rounded bg-red-500/75 shadow flex justify-center items-center hover:bg-red-500/50 duration-300 text-white" onClick={() => removeDesign(index)}></i>
                </div>
              )) : <Loader/>}
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

              <div className="w-full flex flex-col gap-2">
                <label htmlFor="name" className="text-slate-800 font-bold capitalize">
                  font style
                </label>
                <select type="text" defaultValue={'normal'} name="font_style" id="font_style" className="w-full border outline-none focus:border-sky-500 rounded p-2">
                  <option value={'normal'} >normal</option>
                  <option value={'italic'}>italic</option>
                </select>
              </div>

              <div className="w-full flex flex-col gap-2">
                <label htmlFor="name" className="text-slate-800 font-bold capitalize">
                  font weight
                </label>
                <select type="text" defaultValue={'normal'} name="font_weight" id="font_weight" className="w-full border outline-none focus:border-sky-500 rounded p-2">
                  <option value={'normal'} >normal</option>
                  <option value={'bold'}>bold</option>
                </select>
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
