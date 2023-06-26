import styled from '@emotion/styled'
import SITE_METADATA from '../siteMetadata';


const LogoImg = styled.img`
    max-width: ${ props => props.size || '50px'};
    margin: ${props => props.margin || '1em 0'};
    @media only screen and (max-width: 600px){
        max-width: ${ props => props.small || '90%'};
    }
`;
const Logo = props => <LogoImg src={SITE_METADATA.logo} size='75%' {...props}/>;

export default Logo;
