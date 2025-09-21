import NavBar from '@features/ui/NavBar';
import Footer from '@features/ui/Footer';
import SomeRibbon from '@features/ui/SomeRibbon';

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