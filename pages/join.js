import Head from 'next/head';
import Content from '../components/Content';
import Groups from '../components/Groups';
import JoinForm from '../components/JoinForm';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import PartHeader from '../components/PartHeader';

export default function Join() {
  const text = <>Do you want to join Nordlys and take part in the development of Norways first Solar Racing Car and drive the world towards a sustainable future? We accept both normal students, and students who want to write their thesis on the project. See our suggested project subjects under, or suggest your own thesis. <br /><br />NB! <em>You have to apply for your bachelor's or master's thesis through NTNU as well, but by applying here, you may reserve a subject.</em></>
  const groups = {
    'electronics': {
      'name': 'Electronics',
      'image': 'EmbeddedElectronics.png',
      'sensorNetwork': {name: 'Sensor Network', text: 'Gathering data is crucial to drive fast while preserving energy. The sensor network is responsible for gathering a lot of data and sending it to the central telemetry system.', supervisor: 'Not Decided'},
      'telemetry': {name: 'Telemetry', text: 'To use the data from the network system, it has to be transmitted to a following computer. The telemtry system is responsible to transmit data over radio to be used in the driving strategy.', supervisor: 'Not Decided'},
      'electricalSystem': {name: 'Electrical System', text: 'The car contains many small electrical components that needs to be controlled. This includes lighting, wipers, regenetive braking, horn, and more.', supervisor: 'Not Decided'},
      'driverInterface': {name: 'Driver Interface', text: "Without the driver, the car won't drive. The driver interface is embedded in the dashboard, and needs to be designed so the driver can control the entire car with ease.", supervisor: 'Not Decided'},
      'solarPanels': {name: 'Solar Panels', text: "Without the soalr panels, the car wouldn't be a solar racing car. The Solar Panels subgroup designs the electrical system around the solar array, as well as the control system for the panels to ensure full utilization of the array.", supervisor: 'Not Decided'},
      'motors': {name: 'Motors', text: 'There are many ways to design electrical motors, but only the best designs deliver sufficient throughput with low weight usage. This subgroup desides how the motor system should look like, as well as the control units needed to run it.', supervisor: 'Not Decided'},
      'electricalSystem': {name: 'Electrical System', text: 'To bring all the high voltage electrical components together to deliver as much power as possible, the electrical system has to be on point. This subgroup designs the electrical system, including the batteries, motors and solar panels, as well as the smaller electrical components.', supervisor: 'Not Decided'}
    },
    'mechanical': {
      'name': 'Mechanical',
      'image': 'Mechanical.png',
      'braking': {name: 'Braking', text: 'Creating safe but lightweight brakes is a challenge, but one we must conquer to build a successful solar racing car. This system focuses on the design and building of the braking system.', supervisor: 'Not Decided'},
      'suspension': {name: 'Suspension', text: 'This system focuses on designing a lightweight suspension system. Without it, driving the car becomes both unstable and uncomfortable.', supervisor: 'Not Decided'},
      'steering': {name: 'Steering', text: 'The steering system needs to be precise and lightweight, as well as easy to manipulate by the driver. This subgroup designs, test and builds an efficient steering rig. ', supervisor: 'Not Decided'},
      'drivetrain': {name: 'Drivetrain', text: "The drivetrain connects to the electric motors to deliver mechanical power to the wheels. Either if the car uses inwheel motors or external, the drivetrain needs to be lightweight and delver sufficent amounts of torque withoiut loosing too much energy on the way.", supervisor: 'Not Decided'},
      'bearingStructure': {name: 'Bearing Structure', text: 'The car itself needs to carry both the driver and itself, while being lightweight and highly aerodynamic. This subgroup will be working on the design of the chassis and outer shell, testing and tweaking its aerodynamics and bearing characteristics until perfection.', supervisor: 'Not Decided'}
    }, 
    'design': {
      'name': 'Design',
      'image': 'Design.png',
      'exteriorDesign': {name: 'Exterior Design', text: 'Nothing is more important than presentation. The exterior design of the car should be visually attractive as well as showcase the Nordlys brand and sustainability of the project.', supervisor: 'Not Decided'},
      'ergonomicDesign': {name: 'Ergonomic Design', text: 'To ease the work of the driver, and give room to focus on the drving, the driver interface needs a human centered and ergonomic design. This includes the seat, seat belt and dashboard, which all need attention to detail and needs to be well tested to enhance the driver experience.', supervisor: 'Not Decided'}
    },
    'strategy': {
      'name': 'Strategy',
      'image': 'Software.png',
      'dataVisualization': {name: 'Data Visualization', text: "It's impossible to understand the thousands of data points sent from the car during a race just by looking at then. To make sense of the data, this subgroup develops a data visualization interface for the operators to use.", supervisor: 'Not Decided'},
      'dataAnalysis': {name: 'Data Analysis', text: "To make sure the car drives as fast as possible without running out of energy, we need an algorithm. This subgroup develops a model and algorithm to predict future energy needs and suggest an optimal speed given inputs such as route profile, weather forecast and current energy throughputs.", supervisor: 'Not Decided'}
    },
    'brand': {
      'name': 'Brand',
      'image': 'Management.png',
      'brandDeveloper': {name: 'Brand Developer', text: "To reach our amibtios goals, we need a strong and recognizable brand. The brand developers build the brand through strategic marketing and social media, as well as planning and designing the organizations outer image and marketing plan.", supervisor: 'Not Decided'},
      'photoVideo': {name: 'Photo and Video', text: "A good brand needs good and professional photos and videos. The photographers are responsible for capturing the team as we develop, build and compete with the Nordlys car.", supervisor: 'Not Decided'},
      'webDeveloper': {name: 'Web Developer', text: "A proffesional website keeps the audience up to speed on the team and it's work. Develop and build the website, and tell the story of who Nordlys NTNU really are.", supervisor: 'Not Decided'},
      'graphicalDesigner': {name: 'Graphical Designer', text: "One of the most important parts of building a recognizable brand is developing it's graphical profile. The graphical designer creates all the graphical content of Nordlys, either it is the logo, social media posts or recruitment posters.", supervisor: 'Not Decided'}
    }
  }

  return (
      <>
      <Head>
        <title>Nordlys</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout current="Join">
          <></>
          <PageHeader title="Join" />
          <Content dark={true}>
              <PartHeader darkColor={false} title="Apply" text={text} />
              <JoinForm groups={groups} />
              <br></br>
              * The data you submit will be stored by Nordlys until the application is processed. The data will be stored no longer than six months.
          </Content>
          <Groups dark={false} groups={groups}/>
      </Layout>
    </>
  )     
}