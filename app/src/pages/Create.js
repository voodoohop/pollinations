import Box from "@material-ui/core/Box";
import Alert from '@material-ui/lab/Alert';
import Debug from "debug";
import Markdown from 'markdown-to-jsx';
import React, { Suspense, useCallback, useMemo } from "react";
import FormView from '../components/Form';
import { SEO } from "../components/Helmet";
import MediaViewer from '../components/MediaViewer';
import NotebookTitle from "../components/NotebookTitle";
import { getNotebookMetadata } from "../utils/notebookMetadata";
import styled from '@emotion/styled'
import Acordion from "../components/organisms/Acordion";



const debug = Debug("Create");

export default React.memo(function Create({ ipfs, node, dispatch }) {

  const contentID = ipfs[".cid"]

  const { connected } = node

  const metadata = useMemo(() => getNotebookMetadata(ipfs), [ipfs?.input])

  debug("Create", { ipfs, node, metadata })

  const cancelForm = useCallback(() => dispatchInput({ ...ipfs.input, formAction: "cancel" }), [ipfs?.input]);

  debug("ipfs state before rendering model", ipfs)

  const NotebookInfos = [
    { 
      header: 'Details', 
      children: metadata && <Markdown children={metadata?.description} />, 
      defaultExpanded: true 
    },
    { header: 'License', children: 'bla' }
  ]


  return <>
    <Box my={2}>

      <SEO metadata={metadata} ipfs={ipfs} cid={contentID} />

      <NotebookTitle name={metadata?.name} />
      

      <LayoutStyle>

        <div>
          {
            !connected && <Alert severity="info">The inputs are <b>disabled</b> because <b>no Colab node is running</b>! Click on <b>LAUNCH</b> (bottom right) or refer to INSTRUCTIONS for further instructions.</Alert>
          }
          <h3>
            Inputs
          </h3> 
          <FormView
            input={ipfs?.input}
            connected={connected}
            metadata={metadata}
            onSubmit={dispatch} />
        </div>
        
        {
          ipfs.output ? 
          <div >
            <MediaViewer output={ipfs.output} contentID={contentID} />
          </div> 
          : 
          <div>
            {
              NotebookInfos
              .map( info => <Acordion {...info}/> )
            }
          </div>
        }

      </LayoutStyle>
    </Box>
  </>
});

const LayoutStyle = styled.div`
display: grid;
grid-template-columns: repeat(auto-fit, minmax(45%, 1fr));
grid-gap: 4em;
`