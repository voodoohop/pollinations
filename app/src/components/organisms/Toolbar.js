import GpuInfo from "../molecules/GpuInfo"
import styled from '@emotion/styled'
import Button from "@material-ui/core/Button"

const ToolBar = ({ node, showNode }) => <HideOnMobile>
        
     <div style={{
        display: node?.connected ? 'flex' : 'none',
        justifyContent: 'space-between',
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
        <Button onClick={showNode} children='[ Current Pollen ]' />
        <GpuInfo {...node} />
    </div>
</HideOnMobile>

export default ToolBar

const HideOnMobile = styled.div`
@media (max-width: 600px) {
    display: none;
}
`