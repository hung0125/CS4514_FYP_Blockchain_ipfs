const Loader = () => {
    return (
        <div className="flex justify-center items-center py-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-300"/>
        </div>
    );
}

const Loader2 = () => {
    return (
        <div className="flex py-3 mx-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-300"/>
        </div>
    );
}

const Line = () => {
    return (<div className='h-[1px] w-full bg-gray-400 my-2'/>);
}

export {Loader, Loader2, Line};