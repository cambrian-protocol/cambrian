import styled from 'styled-components'

const Inner = styled.div`
    position: absolute;
    bottom: 0;
    right: 100px;
    height: 100%;
    width: 100%;
    background: radial-gradient(closest-side, #4e94bd 10%, transparent 100%);
    opacity: 0.1;
`

const Outer = styled.div`
    position: absolute;
    bottom: -150px;
    left: 0;
    height: 800px;
    width: 1000px;
    max-width: 100vw;

    overflow: hidden;
`

const Glow = () => {
    return (
        <Outer>
            <Inner />
        </Outer>
    )
}

export default Glow
