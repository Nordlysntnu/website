import { posix } from "path";
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
                name: "Aare Hoholm",
                position: "Technical Leader",
                image: "AareHoholm.jpg",
                email: "aare.hoholm@nordlysntnu.no"
            },
            {
                name: "Sebastian Jacobsen",
                position: "Co-founder and Head of Competition",
                image: "SebastianJacobsen.jpg",
                email: "sebastian.jacobsen@nordlysntnu.no"
            },
            {
                name: "Maren Henæs Sand",
                position: "Head of Brand",
                image: "MarenSand.jpg",
                email: "maren.sand@nordlysntnu.no"
            },
            {
                name: "Erik Fougner Arnesen",
                position: "Head of Production",
                image: "ErikArnesen.jpg",
                email: "erik.arnesen@nordlysntnu.no"
            },
            {
                name: "Paul Våge",
                position: "Head of Finance",
                image: "PaulVåge.jpg",
                email: "paul.vaage@nordlysntnu.no"
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
                name: "Anders Nyhus Røsbjørgen",
                position: "Mechanical Engineer",
                image: "AndersRøsbjørgen.jpg",
                email: "anders.rosbjorgen@nordlysntnu.no"
            },
            {
                name: "Julian Boerakker",
                position: "Mechanical Engineer",
                image: "",
                email: "julian.boerakker@nordlysntnu.no"
            },
            {
                name: "Eléa Cervera",
                position: "Mechanical Engineer",
                image: "EléaCervera.jpg",
                email: "elea.cervera@nordlysntnu.no"
            },
            {
                name: "Cato Bergan",
                position: "Mechanical Engineer",
                image: "CatoBergan.jpg",
                email: "cato.bergan@nordlysntnu.no"
            },
            {
                name: "Paul Gustav Aparicio Lofsberg",
                position: "Mechanical Engingeer",
                image: "GustavLofsberg.jpg",
                email: "gustav.lofsberg@nordlysntnu.no"
            },
            {
                name: "Sander Ranbø",
                position: "Mechanical Engineer",
                image: "SanderRanbø.jpg",
                email: "sander.ranbo@nordlysntnu.no"
            },
            {
                name: "Oscar Skjelvik",
                position: "Mechanical Engineer",
                image: "OscarSkjelvik.jpg",
                email: "oscar.skjelvik@nordlysntnu.no"
            },
            {
                name: "Aslak Aarflot Jønsson",
                position: "Mechanical Engineer",
                image: "",
                email: "aslak.jonsson@nordlysntnu.no"
            },
            {
                name: "Joachim Gulliksen",
                position: "Mechanical Engineer",
                image: "",
                email: "joachim.gulliksen@nordlysntnu.no"
            },
            {
                name: "Sjur Weider",
                position: "Mechanical Engineer",
                image: "",
                email: "sjur.weider@nordlysntnu.no"
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
                name: "Odin Sandlie Mellingsæter",
                position: "Electrical Engineer",
                image: "OdinMellingsæter.jpg",
                email: "odin.mellingsæter@nordlysntnu.no"
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
                name: "Sander Mikkelhaug",
                position: "Electrical Engineer",
                image: "",
                email: "sander.mikkelhaug@nordlysntnu.no"
            },
            {
                name: "Natalia Chwiejczak",
                position: "Electrical Engineer",
                image: "",
                email: "natalia.chwiejczak@nordlysntnu.no"
            },
            {
                name: "Elias Alsos",
                position: "Electrical Engineer",
                image: "EliasAlsos.jpg",
                email: "elias.alsos@nordlysntnu.no"
            },
            {
                name: "Simon Jaccard Buggeland",
                position: "Electrical Engineer",
                image: "SimonBuggeland.jpg",
                email: "simon.buggeland@nordlysntnu.no"
            },
            {
                name: "Vetle Vatnem",
                position: "Electrical Engineer",
                image: "VetleVatnem.jpg",
                email: "vetle.vatnem@nordlysntnu.no"
            },
            {
                name: "Johanne Mjøs Bertelsen",
                position: "Electrical Engineer",
                image: "JohanneBertelsen.jpg",
                email: "johanne.bertelsen@nordlysntnu.no"
            },
            {
                name: "Markus Emil Eriksson",
                position: "Electrical Engineer",
                image: "MarkusEriksson.jpg",
                email: "markus.eriksson@nordlysntnu.no"
            },
            {
                name: "Ivar Hansgård",
                position: "Electrical Engineer",
                image: "",
                email: "ivar.hansgard@nordlysntnu.no"
            }
        ],
        "Strategy": [
            {
                name: "Jakob Behrens",
                position: "Group Leader Strategy",
                image: "JakobBehrens.jpg",
                email: "jakob.behrens@nordlysntnu.no"
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
            },
            {
                name: "Nicolai Nome Sommervold",
                position: "Software Developer",
                image: "",
                email: "nicolai.sommervold@nordlysntnu.no"
            },
            {
                name: "Natalie Vo",
                position: "Software Developer",
                image: "NatalieVo.jpg",
                email: "natalie.vo@nordlysntnu.no"
            },
            {
                name: "Rasmus Nummelin",
                position: "Software Developer",
                image: "",
                email: "rasmus.nummelin@nordlysntnu.no"
            },
            {
                name: "Mathias Sagerup",
                position: "Software Developer",
                image: "MathiasSagerup.jpg",
                email: "mathias.sagerup@nordlysntnu.no"
            }
        ],
        "Brand": [
            {
                name: "Maren Henæs Sand",
                position: "Head of Brand",
                image: "MarenSand.jpg",
                email: "maren.sand@nordlysntnu.no"
            },
            {
                name: "Johannes Tunli Moe",
                position: "Key Account Manager",
                image: "JohannesMoe.jpg",
                email: "johannes.moe@nordlysntnu.no"
            },
            {
                name: "Stine Andreassen",
                position: "Brand Developer",
                image: "StineAndreassen.jpg",
                email: "stine.andreassen@nordlysntnu.no"
            },
            {
                name: "Leonardo Lind-Milekvist",
                position: "Web Developer",
                image: "LeonardoLind-Milekvist.jpg",
                email: "leonardo.lind-milekvist@nordlysntnu.no"
            },
            {
                name: "Emil Vellan",
                position: "Web Developer",
                image: "EmilVellan.jpg",
                email: "emil.vellan@nordlysntnu.no"
            }
        ],
        "Logistics": [
            {
                name: "Sebastian Jacobsen",
                position: "Co-founder and Head of Competition",
                image: "SebastianJacobsen.jpg",
                email: "sebastian.jacobsen@nordlysntnu.no"
            },
            {
                name: "Hedda Christine Reinskou",
                position: "Logistics Engineer",
                image: "HeddaReinskou.jpg",
                email: "hedda.reinskou@nordlysntnu.no"
            },
            {
                name: "Sven Amberg",
                position: "Logistics Engineer",
                image: "",
                email: "sven.amberg@nordlysntnu.no"
            },
            {
                name: "Sigve Isaksen",
                position: "logistics Engineer",
                image: "",
                email: "sigve.isaksen@nordlysntnu.no"
            }
        ],
        "Alumni": [
            {
                name: "Aurora Vinslid",
                position: "Co-founder",
                image: "AuroraVinslid.jpg",
                email: "aurora.vinslid@nordlysntnu.no"
            },
            {
                name: "Oliver Meijer Angerman",
                position: "",
                image: "OliverAngerman.jpg",
                email: "oliver.angerman@nordlysntnu.no"
            },
            {
                name: "Emil Blom Ørnes",
                position: "",
                image: "EmilØrnes.jpg",
                email: "emil.ornes@nordlysntnu.no"
            },
            {
                name: "Benjamin Tryggestad",
                position: "",
                image: "BenjaminTryggestad.jpg",
                email: "benjamin.tryggestad@nordlysntnu.no"
            },
            {
                name: "Immanuel Leps",
                position: "",
                image: "ImmanuelLeps.jpg",
                email: "immanuel.leps@nordlysntnu.no"
            },
            {
                name: "Mathieu Pelissier",
                position: "",
                image: "MathieuPelissier.jpg",
                email: "mathieu.pelissier@nordlysntnu.no"
            },
            {
                name: "Erik Kristoffer Øhlckers",
                position: "",
                image: "KristofferØhlckers.jpg",
                email: "kristoffer.øhlckers@nordlysntnu.no"
            },
            {
                name: "Kristian Østensen",
                position: "",
                image: "KristianØstensen.jpg",
                email: "kristian.ostensen@nordlysntnu.no"
            },
            {
                name: "Andrea Al Muktash",
                position: "",
                image: "AndreaAlMuktash.jpg",
                email: "andrea.almuktash@nordlysntnu.no"
            },
            {
                name: "Darius Salehi",
                position: "",
                image: "DariusSalehi.jpg",
                email: "darius.salehi@nordlysntnu.no"
            },
            {
                name: "Boris Bajla",
                position: "",
                image: "BorisBajla.jpg",
                email: "boris.bajla@nordlysntnu.no"
            },
            {
                name: "Mathilde Skaset-Haarr",
                position: "",
                image: "MathildeSkaset-Haarr.jpg",
                email: "mathilde.skaset-haarr@nordlysntnu.no"
            },
            {
                name: "Johan Storesund",
                position: "",
                image: "JohanStoresund.jpg",
                email: "johan.storesund@nordlysntnu.no"
            },
            {
                name: "Birger Christopher Stein Bjelke",
                position: "",
                image: "BirgerBjelke.jpg",
                email: "birger.bjelke@nordlysntnu.no"
            },
            {
                name: "Hilmi Furkan Yasik",
                position: "",
                image: "HilmiYasik.jpg",
                email: "hilmi.yasik@nordlytnu.no"
            },
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