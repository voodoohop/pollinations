import { HorizontalBorder } from "../atoms/Borders"
import styled from '@emotion/styled'

const HorizontalList = ({ title, children }) => {

    return <Container>
        <h4>
            {title}
        </h4>
        <HorizontalBorder />
        <ListContainer>
            {children}
        </ListContainer>
    </Container>
}

const Container = styled.div`
margin: 1em 0;
text-align: justify;
text-transform: uppercase;
`

const ListContainer = styled.div`
width: 100%;

display: grid;
grid-gap: 0.5em;
grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));

`

export default HorizontalList