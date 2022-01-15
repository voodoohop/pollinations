import WallpaperIcon from '@material-ui/icons/Wallpaper';
import Debug from 'debug';
import readMetadata from '../utils/notebookMetadata';



const debug = Debug('notebooks');

// get list of notebooks from IPNS path
// this should be refactored once we cleaned the IFPS state code
// no need to do raw ipfs operations or data mangling here
export const getNotebooks = (ipfsState) => {

  debug("ipfsState",ipfsState)
  if (!ipfsState) return null
  
  const notebookCategories = Object.keys(ipfsState);
  console.log(ipfsState)
  const allNotebooks = notebookCategories.map(category => {
    const notebooks = Object.entries(ipfsState[category]);
    debug('getNotebooks', category, notebooks);
  
    return notebooks.map(([name, notebookFolder]) => {

      const cid = notebookFolder[".cid"];
      const notebookJSON = notebookFolder["input"]["notebook.ipynb"];
      const { description } = readMetadata(notebookJSON)

      return {
        category, 
        name, 
        path:`/p/${cid}/create`, 
        description,
        Icon: WallpaperIcon
      };
    });
  }).flat();
  
  const categorizedNotebooks = groupBy(allNotebooks, notebook => notebook.category) || []
  
  return [ allNotebooks, categorizedNotebooks ]
}

// convenience.........
function groupBy(array, f) {
  return array.reduce((r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), {});
}
