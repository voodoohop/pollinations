import { Button, IconButton } from "@material-ui/core"
import GpuInfo from "../molecules/GpuInfo"
import styled from '@emotion/styled'

const ToolBarHeader = ({ go2Pollen, isConnected }) => <div style={{
        display: isConnected ? 'flex' : 'none',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    }} >
    <Button onClick={go2Pollen} children='[ Current Pollen ]' />            
</div>



const ToolBar = ({ node, showNode }) => <HideOnMobile>
        
     <div style={{
        display: node?.connected ? 'flex' : 'none',
        alignItems: 'center',
        position: 'fixed',
        bottom: 0,
        right: 30,
        minWidth: '325px',
        maxWidth: '470px',
        height: 50,
        borderRadius: '10px 10px 0 0',
        backgroundColor: '#222',
        padding: '1.3em',
    }} >
        <ToolBarHeader 
            go2Pollen={showNode} 
            node={node} />

        <GpuInfo {...node} />
    </div>
</HideOnMobile>

export default ToolBar

const HideOnMobile = styled.div`
@media (max-width: 600px) {
    display: none;
}
`