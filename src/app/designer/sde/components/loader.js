import { FabricImage, IText } from 'fabric'
import { useEffect, useState } from 'react';

export default function Loader() {
    return (
        <div className='flex justify-center items-center loading'>
            <div className="flex flex-row gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-700 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-blue-700 animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-2 h-2 rounded-full bg-blue-700 animate-bounce [animation-delay:-.5s]"></div>
            </div>
        </div>
    );
}
