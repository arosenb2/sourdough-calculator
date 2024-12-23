import { PlusIcon, PrinterIcon, BookmarkIcon, CheckIcon, ShareIcon } from '@heroicons/react/24/outline';

export default function RecipeActions({ 
  onNew, 
  onShare, 
  onSave, 
  onPrint, 
  saved 
}) {
  return (
    <div className="print:hidden mb-4 flex justify-between items-center">
      <button
        onClick={onNew}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base"
      >
        <PlusIcon className="h-5 w-5" />
        New
      </button>
      <div className="flex gap-2">
        <button
          onClick={onShare}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base"
        >
          <ShareIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Share</span>
        </button>
        <button
          onClick={onSave}
          disabled={saved}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base"
        >
          {saved ? (
            <>
              <CheckIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Saved</span>
            </>
          ) : (
            <>
              <BookmarkIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Save</span>
            </>
          )}
        </button>
        <button
          onClick={onPrint}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base"
        >
          <PrinterIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Print</span>
        </button>
      </div>
    </div>
  );
}