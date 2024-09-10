import Content from "./Content";
import TeamGroup from "./TeamGroup";

export default function TeamOverview() {
    const members = {
        "Board": [
            {
                name: "Sivert Sande Kverme",
                position: "Co-founder and Team Leader",
                image: "SivertKverme.jpg",
                email: "sivert.kverme@nordlysntnu.no"
            },
            {
                name: "Aurora Vinslid",
                position: "Co-founder and Head of Finance",
                image: "AuroraVinslid.jpg",
                email: "aurora.vinslid@nordlysntnu.no"
            },
            {
                name: "Aare Hoholm",
                position: "Technical Leader",
                image: "AareHoholm.jpg",
                email: "aare.hoholm@nordlysntnu.no"
            },
            {
                name: "Sebastian Jacobsen",
                position: "Co-founder and Head of Brand",
                image: "SebastianJacobsen.jpg",
                email: "sebastian.jacobsen@nordlysntnu.no"
            }
        ],
        "Mechanical": [
            {
                name: "Daniel Nicolai Grønn",
                position: "Group Leader Mechanical",
                image: "DanielGrønn.jpg",
                email: "daniel.gronn@nordlysntnu.no"
            },
            {
                name: "Tord Østmo",
                position: "Designer",
                image: "TordØstmo.jpg",
                email: "tord.ostmo@nordlysntnu.no"
            },
            {
                name: "Mats Ørbekk",
                position: "Mechanical Engineer",
                image: "MatsØrbekk.jpg",
                email: "mats.ordbekk@nordlysntnu.no"
            },
            {
                name: "Oliver Meijer Angerman",
                position: "Mechanical Engineer",
                image: "OliverAngerman.jpg",
                email: "oliver.angerman@nordlysntnu.no"
            },
            {
                name: "Anders Nyhus Røsbjørgen",
                position: "Mechanical Engineer",
                image: "AndersRøsbjørgen.jpg",
                email: "anders.rosbjorgen@nordlysntnu.no"
            },
            {
                name: "Emil Blom Ørnes",
                position: "Mechanical Engineer",
                image: "EmilØrnes.jpg",
                email: "emil.ornes@nordlysntnu.no"
            },
            {
                name: "Benjamin Tryggestad",
                position: "Mechanical Engineer",
                image: "BenjaminTryggestad.jpg",
                email: "benjamin.tryggestad@nordlysntnu.no"
            },
            {
                name: "Immanuel Leps",
                position: "Mechanical Engineer",
                image: "ImmanuelLeps.jpg",
                email: "immanuel.leps@nordlysntnu.no"
            },
            {
                name: "Mathieu Pelissier",
                position: "Mechanical Engineer",
                image: "MathieuPelissier.jpg",
                email: "mathieu.pelissier@nordlysntnu.no"
            }
        ],
        "Electrical": [
            {
                name: "Kristian Sæberg",
                position: "Group Leader Electrical",
                image: "KristianSæberg.jpg",
                email: "kristian.saeberg@nordlysntnu.no"
            },
            {
                name: "Sukhman Singh Sidhu",
                position: "Electrical Engineer",
                image: "SukhmanSidhu.jpg",
                email: "sukhman.sidhu@nordlysntnu.no"
            },
            {
                name: "William Fosser",
                position: "Electrical Engineer",
                image: "WilliamFosser.jpg",
                email: "william.fosser@nordlysntnu.no"
            },
            {
                name: "Erik Kristoffer Øhlckers",
                position: "Electrical Engineer",
                image: "KristofferØhlckers.jpg",
                email: "kristoffer.øhlckers@nordlysntnu.no"
            },
            {
                name: "Odin Sandlie Mellingsæter",
                position: "Electrical Engineer",
                image: "OdinMellingsæter.jpg",
                email: "odin.mellingsæter@nordlysntnu.no"
            },
            {
                name: "Kristian Østensen",
                position: "Electrical Engineer",
                image: "KristianØstensen.jpg",
                email: "kristian.ostensen@nordlysntnu.no"
            },
            {
                name: "Øystein Økland",
                position: "Electrical Engineer",
                image: "ØysteinØkland.jpg",
                email: "oystein.okland@nordlysntnu.no"
            },
            {
                name: "Georg Hofstad",
                position: "Electrical Engineer",
                image: "GeorgHofstad.jpg",
                email: "georg.hofstad@nordlysntnu.no"
            },
            {
                name: "Andrea Al Muktash",
                position: "Electrical Engineer",
                image: "AndreaAlMuktash.jpg",
                email: "andrea.almuktash@nordlysntnu.no"
            },
            {
                name: "Darius Salehi",
                position: "Electrical Engineer",
                image: "DariusSalehi.jpg",
                email: "darius.salehi@nordlysntnu.no"
            },
            {
                name: "Boris Bajla",
                position: "Electrical Engineer",
                image: "BorisBajla.jpg",
                email: "boris.bajla@nordlysntnu.no"
            }
        ],
        "Strategy": [
            {
                name: "Mathilde Skaset-Haarr",
                position: "Group Leader Strategy",
                image: "MathildeSkaset-Haarr.jpg",
                email: "mathilde.skaset-haarr@nordlysntnu.no"
            },
            {
                name: "Johan Storesund",
                position: "Software Developer",
                image: "JohanStoresund.jpg",
                email: "johan.storesund@nordlysntnu.no"
            },
            {
                name: "Bjørn Vik Henriksen",
                position: "Software Developer",
                image: "BjørnHenriksen.jpg",
                email: "bjorn.henriksen@nordlysntnu.no"
            },
            {
                name: "Eirik Reiestad",
                position: "Software Developer",
                image: "EirikReiestad.jpg",
                email: "eirik.reiestad@nordlysntnu.no"
            }
        ],
        "Brand": [
            {
                name: "Sebastian Jacobsen",
                position: "Co-founder and Head of Brand",
                image: "SebastianJacobsen.jpg",
                email: "sebastian.jacobsen@nordlysntnu.no"
            },
            {
                name: "Birger Christopher Stein Bjelke",
                position: "Brand Developer",
                image: "BirgerBjelke.jpg",
                email: "birger.bjelke@nordlysntnu.no"
            },
            {
                name: "Hilmi Furkan Yasik",
                position: "Brand Developer",
                image: "HilmiYasik.jpg",
                email: "hilmi.yasik@nordlytnu.no"
            },
            {
                name: "Johannes Tunli Moe",
                position: "Key Account Manager",
                image: "JohannesMoe.jpg",
                email: "johannes.moe@nordlysntnu.no"
            },
            {
                name: "Maren Henæs Sand",
                position: "Key Account Manager",
                image: "MarenSand.jpg",
                email: "maren.sand@nordlysntnu.no"
            }
        ],
    }

    return (
        <Content dark={false}>
            {
                Object.keys(members).map((groupName, i) => (
                    <TeamGroup groupName={groupName} members={members[groupName]} />
                ))
            }
        </Content>
    )
}