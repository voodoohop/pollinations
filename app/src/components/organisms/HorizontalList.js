import { HorizontalBorder } from "../atoms/Borders"
import styled from '@emotion/styled'

const HorizontalList = ({ title, children, idx }) => {
    console.log(children.length)
    return <Container Count={children.length} Idx={idx}>
        <h4>
            {title}
        </h4>
        <HorizontalBorder />
        <ListContainer >
            {children}
        </ListContainer>
    </Container>
}

const Container = styled.div`
width: ${props => `${25 * props.Count}%`};
grid-column: ${props => props.Idx % 4} / ${props => props.Count + 1} ;
margin: 1em 0;
text-align: left;
`

const ListContainer = styled.div`

display: grid;
grid-gap: 5em;
grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));

`

export default HorizontalList