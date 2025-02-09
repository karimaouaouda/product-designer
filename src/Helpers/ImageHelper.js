export default class ImageHelper{

    static createBoard(width, height){
        let board = document.createElement('canvas')
		//set the width and the height to the product image width/height
		board.width = width
		board.height = height
        return board;
    }

    static mergeImages(images = [], options){

        let canvas = ImageHelper.createBoard(options.width, options.height)
        let ctx = canvas.getContext('2d')

        images.forEach(img => {
            let image = null
            let pos = {x : 0, y : 0}
            if(!(img.src instanceof HTMLImageElement)){
                image = new Image()
                image.width = img.width ? img.width : image.width
                image.height = img.height ? img.height : image.height

                image.src = img.src
            }else{
                image = new Image()
                image.src = img.src
            }
            image.crossOrigin = 'anonymous'

            
            if(img.width){
                console.log(image, img.x ?? pos.x, img.y ?? pos.y, img.width, img.height)
                ctx.drawImage(image, img.x ?? pos.x, img.y ?? pos.y, img.width, img.height)
            }else{
                console.log(image, img.x ?? pos.x, img.y ?? pos.y)
                ctx.drawImage(image, img.x ?? pos.x, img.y ?? pos.y)
            }
        })

        return canvas.toDataURL('png', 0.8)
    }

    static downloadImage(src, type = 'png',  name = 'image'){
        let a = document.createElement('a')
		a.href = src
		a.download = 'abdou.' + type 
		a.style.display = 'none'
		document.body.append(a)
		a.click()
		a.remove()
    }
}