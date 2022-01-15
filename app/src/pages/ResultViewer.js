import { TextField } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Debug from "debug";
import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../components/Helmet";
import { IpfsLog } from "../components/Logs";
import MediaViewer from "../components/MediaViewer";
import BigPreview from "../components/molecules/BigPreview";
import MarkDownContent from '../components/molecules/MarkDownContent';
import { NotebookProgress } from "../components/NotebookProgress";
import NotebookTitle from "../components/NotebookTitle";
import { mediaToDisplay } from "../data/media";
import { getNotebookMetadata } from "../utils/notebookMetadata";



// STREAM VIEWER (/n)

const debug = Debug("ResultViewer");

export default memo(function ResultViewer({ ipfs }) {



  const { images, first } = useMemo(() => {
    return mediaToDisplay(ipfs.output)
  }, [ipfs?.output])

  if (!ipfs?.output)
    return <h2>Warming up... Results should start appearing soon.</h2>

  const metadata = getNotebookMetadata(ipfs)
  const contentID = ipfs[".cid"]

  const primaryInputField = metadata?.primaryInput
  const primaryInput = ipfs?.input?.[primaryInputField]


  const success = ipfs?.output?.success !== false
  debug("success", success, ipfs?.output)
  debug("ModelViewer CID", contentID)
  debug("ModelViewer IPFS", ipfs)




  return <Box my={2}>

    <SEO metadata={metadata} ipfs={ipfs} cid={contentID} />

    {   // Waiting Screen goes here
      !contentID &&
      <Typography>
        Connecting to GPU...
      </Typography>
    }
    <br/>
    <NotebookProgress output={ipfs?.output} metadata={metadata} />
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))'}}>

    {/* Left */}
      <div style={{display: 'flex', gridGap: '1em', flexDirection: 'column' }}>
        
        <TextField
          disabled
          fullWidth
          label='Notebook Name'
          value={metadata?.name}/>
        
        <TextField
          disabled
          fullWidth
          label='Text Input'
          value={primaryInput}/>
        
          <Button color="default" to={`/p/${contentID}/create`} component={Link}>
            [ Clone ]
          </Button>

        <IpfsLog ipfs={ipfs} contentID={contentID} />

      </div>
      
    {/* Right */}
      <div>

        {success ? <Preview {...{ first, primaryInput, ipfs }} /> : <MarkDownContent id={"failure"} contentID={contentID} />}
      
      </div>


    </div>
  </Box>
})

function Preview({ first, primaryInput, ipfs }) {
  return <>
    <Box marginTop='2em' minWidth='100%' display='flex'
      justifyContent='space-around' alignItems='flex-end' flexWrap='wrap'>

      <BigPreview {...first} />

      
    </Box>

    {/* previews */}
    {ipfs.output && <div>
      <MediaViewer output={ipfs.output} contentID={ipfs[".cid"]} />
    </div>}
  </>
}
