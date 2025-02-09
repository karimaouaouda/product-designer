import Swal from "sweetalert2";
import nextConfig from "../../../../../../next.config.mjs";

export default function TextTools({ canvas, setShowUploadFontForm }) {



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


	return (
		<div className="tools w-full py-4  border h-auto lg:h-screen flex flex-col justify-between items-center">
			<div className="flex flex-col items-center">
				<div className="flex w-full justify-between items-center px-4">
					<button onClick={setTextToBold} className="px-2 py-1 text-lg border shadow-md rounded font-extrabold">
						<i className="bi bi-type-bold text-xl"></i>
					</button>
					<button onClick={setTextToItalic} className="px-2 py-1 text-lg border shadow-md rounded italic">
						<i className="bi bi-type-italic text-xl"></i>
					</button>
					<button onClick={setTextToUnderline} className="px-2 py-1 text-lg border shadow-md rounded underline">
						<i className="bi bi-type-underline text-xl"></i>
					</button>

					<button onClick={setTextTostrikethrough} className="px-2 py-1 text-lg border shadow-md rounded ">
						<i className="bi bi-type-strikethrough text-xl"></i>
					</button>

				</div>

				<div className="flex items-center space-x-4 w-full mt-8 px-4">
					<span className="text-lg font-semibold">
						Text color :
					</span>
					<input onChange={changeTextColor} type="color" className="border border-sky-800 rounded w-6 h-6 shadow-md" />
				</div>

				<div className="flex items-center space-x-4 w-full mt-8 px-4">
					<span className="text-lg font-semibold">
						Font :
					</span>
					<select onChange={setTextFontFamily} name="font" id="font" defaultValue={"d"} className="border border-sky-800 rounded w-auto text-sm h-8 shadow-md">
						<option value="d" disabled>Select a font</option>
						<option value="arial">Arial</option>
						<option value="poppin">Times New Roman</option>
						<option value="verdana">Verdana</option>
						<option value="helvetica">Helvetica</option>
						<option value="courier">Courier</option>
						<option value="comic">Comic Sans MS</option>
					</select>
				</div>

				<div className="w-full flex justify-center mt-4">
					<button onClick={() => setShowUploadFontForm(true)} className="px-3 text-lg font-semibold capitalize py-2 rounded-md bg-sky-400">
						upload font
					</button>
				</div>
			</div>

			<button className="border rounded p-2 shadow flex space-x-2 items-center" onClick={async () => await saveDesign()}>
				<i className="bi bi-check-lg"></i>
				<span className="font-semibold tracking-wide">
					save design
				</span>
			</button>
		</div>
	);
}
