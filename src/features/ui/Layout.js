import NavBar from './NavBar';
import Footer from './Footer';
import SomeRibbon from './SomeRibbon';

export default function({ children, current }) {
    return (
        <>
            <NavBar current={current} />
            <div>{children[0]}</div>
            <SomeRibbon />
            <div>{children.slice(1)}</div>
            <Footer />
        </>
    )
}