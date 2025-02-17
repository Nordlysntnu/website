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
    
    'board': {
      'name': 'Board',
      'image': 'Management.png',
      'projectManager': {name: 'Project Manager', text: <><br/>
      The Project Manager is the leader of Nordlys NTNU and Project 2026. Your responsibility will be to set the overall direction of the organization and coordinate the technical and non-technical efforts of the project. Together with the rest of the Board you oversee the progress of the car, make sure that the organization is financially stable, and that the members is motivated. In addition, the project manager is the leader of the Board, both leading the board meetings and developing the Board as a well-functioning team.
      <br/>
      <br/>
      <em>Areas of responsibility</em>
      <br/>
      <div style={{paddingLeft: "2em", marginTop: "0.4em", lineHeight: "1.4em"}}>
        Organizational development
        <br/>
        Project planning and execution
        <br/>
        Team and personell development
      </div>
      <br/>
      <em>What do you get out of being Project Manager in Nordlys NTNU?</em>
      <br/>
      <div style={{paddingLeft: "2em", marginTop: "0.2em", lineHeight: "1.4em"}}>
        Experience of leading an interdisciplinary engineering project
        <br/>
        Experience with organizational development
        <br/>
        Experience of managing interpersonal relationships
        <br/>
        Possibility to set the path and strategic direction of Nordlys NTNU
      </div>
      </>,
      },
      'heaadOfCompetition': {name: 'Head of Competition', text: <><br/>
      The Head of Competition acts as a board member, and the group leader of the logistics group in Nordlys NTNU. Building a solar car is all well and good, but someone needs to make sure that it gets transported timely, and safely, to, through and back again from competitions. The Head of Competition leads the logistics group in their tasks regarding everything logistics-related when it comes to participate in competitions, from transportation and shipping, to planning where everyone should sleep, how electricity will be supplied, how food will be transported and stored, as well as safety-related activities and precautions. The challenge in this role is to weigh usefullness up against costs and safety, to perform the right amount of research, and to be organized in the work being done.
      <br/>
      <br/>
      <em>Areas of responsibility</em>
      <br/>
      <div style={{paddingLeft: "2em", marginTop: "0.4em", lineHeight: "1.4em"}}>
        Everything logistics related to participation in solar races.
        <br/>
        Group leader responsibility for the logistics group.
        <br/>
        Planning time schedules for participation in competitions.
      </div>
      <br/>
      <em>What do you get out of being Head of Competition in Nordlys NTNU?</em>
      <br/>
      <div style={{paddingLeft: "2em", marginTop: "0.2em", lineHeight: "1.4em"}}>
        Experience with management in a start-up organization. 
        <br/>
        Direct communication and negotiation with industry actors.
        <br/>
        Experience in planning, and leading a group in research-based activities, culminating in a complete plan for the participation in a competition for a whole team.
        <br/>
        Possibility of shaping and defining logistics-procedures in a new organization
      </div>
      </>,
      },
      'headOfProduction': {name: 'Head of Production', text: <><br/>
      The Head of Production has a central role in Nordlys NTNU, and your job is crucial for the success of the project. You’ll have the main responsibility for ensuring that production is managed in such a way that the project's goals for economy, quality, and progress are achieved. The most important areas will be production planning, development and assembly of the car. As the head of production, you will be part of the board and you get a key role in deciding the production specifications and assembly of the car. 
      <br/>
      <br/>
      <em>Areas of responsibility</em>
      <br/>
      <div style={{paddingLeft: "2em", marginTop: "0.4em", lineHeight: "1.4em"}}>
        Production planning
        <br/>
        Responsible for the progression of the technical groups
        <br/>
        The assembly of the car
      </div>
      <br/>
      <em>What do you get out of being Head of Production in Nordlys NTNU?</em>
      <br/>
      <div style={{paddingLeft: "2em", marginTop: "0.2em", lineHeight: "1.4em"}}>
        Hands-on engineering experience 
        <br/>
        Experience with management in a start-up organization
        <br/>
        Experience of coordinating different groups in the same project
        <br/>
        Possibility to shape the organization and production manner
      </div>
      </>,
      },
      'headOfFinance': {name: 'Head of Finance', text: <><br/>
      As Head of Finance in Nordlys NTNU you get the opportunity to develop skills in management, economics and accounting at a high level in Norway’s first solar-racing team. In this position you are the main responsible for the budget, liquidity and accounting. You will also get the opportunity to explore financial analysis and financial projections to evaluate future revenue potential for the newl established organization.
      <br/>
      <br/>
      <em>Areas of responsibility</em>
      <br/>
      <div style={{paddingLeft: "2em", marginTop: "0.4em", lineHeight: "1.4em"}}>
        Economics and finance
        <br/>
        Budget and accounting
        <br/>
        Management
        <br/>
        Following up and teaching group leaders in economic procedures
      </div>
      <br/>
      <em>What do you get out of being Head of Finance in Nordlys NTNU?</em>
      <br/>
      <div style={{paddingLeft: "2em", marginTop: "0.2em", lineHeight: "1.4em"}}>
        Great skills in financial management
        <br/>
        Experience with management in a start-up organization
        <br/>
        Experience the interface between economics and technology in a professional arena
        <br/>
        Freedom to design your vision of the organization and economics
      </div>
      </>,
      },
      'headOfMarketing': {name: 'Head of Marketing', text: <><br/>
      Head of Marketing is the person in charge of the marketing, sponsoring work, event planning, graphical design and general branding of Nordlys NTNU. You should not pass up this opportunity to help build our organizations external image, gain experience in management and being in touch with external partners. As a newly established organization, you have a great opportunity to put your mark on the organization, and help steer its direction for years to come!
      <br/>
      <br/>
      <em>Areas of responsibility</em>
      <br/>
      <div style={{marginTop: "0.4em", lineHeight: "1.4em"}}>
        Marketing
        <br/>
        <div style={{paddingLeft: "2em", marginTop: "0.4em", lineHeight: "1.4em"}}>
          Developing a marketing plan/strategy
          <br/>
          Plan and conduct recruitment
          <br/>
          Plan and conduct events (external and internal)
          <br/>
          Control social media-accounts
        </div>
      </div>
      <div style={{marginTop: "0.4em", lineHeight: "1.4em"}}>
      Sponsors
        <br/>
        <div style={{paddingLeft: "2em", marginTop: "0.4em", lineHeight: "1.4em"}}>
          Acquiring new partners and sponsors
          <br/>
          Follow up acquired partners and sponsors
        </div>
      </div>
      <div style={{marginTop: "0.4em", lineHeight: "1.4em"}}>
      Graphical design
        <br/>
        <div style={{paddingLeft: "2em", marginTop: "0.4em", lineHeight: "1.4em"}}>
        Defining and maintaining graphical profile
        </div>
      </div>
      <br/>
      <em>What do you get out of being Head of Marketing in Nordlys NTNU?</em>
      <br/>
      <div style={{paddingLeft: "2em", marginTop: "0.2em", lineHeight: "1.4em"}}>
      Great skills in financial management
      <br/>
      Experience with management in a start-up organization
      <br/>
      Experience the interface between economics and technology in a professional arena
      <br/>
      Freedom to design your vision of the organization and economics
      </div>
      </>,
      },
      'technicalLeader': {name: 'Technical Leader', text: <><br/>
        The Technical Leader holds a central role in Nordlys NTNU, and your job is crucial for the technical progression of the project. You will have the main responsibility for ensuring that the technical groups work in accordance with competition regulations. As the Technical Leader, you will be part of the Board and play a crucial role in deciding the project's direction and execution.
        <br/>
        <br/>
        <em>Areas of responsibility</em>
        <br/>
        <div style={{paddingLeft: "2em", marginTop: "0.4em", lineHeight: "1.4em"}}>
          Responsible for project planning and the work methodology.
          <br/>
          Collaborate closely with the technical group leaders.
          <br/>
          Ensure the areas of responsibilities among the groups and ensure technical progress according to regulations.
          <br/>
          Coordination of the Concept and Design Phase.
          <br/>
          Organizes and arranges Concept and Design Reviews.
          <br/>
          Contact relevant technical sponsors or advisors, facilitating collaboration with external partners.
          <br/>
          Collaborate with the Board and develop the organization.
        </div>
        <br/>
        <em>What do you get out of being Technical Leader in Nordlys NTNU?</em>
        <br/>
        <div style={{paddingLeft: "2em", marginTop: "0.2em", lineHeight: "1.4em"}}>
          Hands-on project management experience.
          <br/>
          Experience with leadership in a start-up organization.
          <br/>
          Experience in coordinating different groups within the same project.
          <br/>
          Technical experience with car development.
        </div>
        </>,
        },
      },
    'electrical': {
      'name': 'Electrical',
      'image': 'EmbeddedElectronics.png',
      'description': 'The electrical group is responsible for all the electricity on board the car. This includes both the high and low voltage systems.',
      //'electricalEngineer': {name: 'Electrical Engineer', text: "As the project is beginning its production phase, Nordlys is in need of ever more engaged and interested electrical members. The electrical group is looking for students with interest or experience in programming, electrical digital design (CAD) and electrical engineering, both high and low voltage.", supervisor: 'Not decided'}
      'groupLeader': {name: 'Group Leader Electrical', text: 'The group leader is the leader of the electrical members. This is both a responsibility, and an oppurtunity of closer form the direction of the organization and the car. Most group leaders have responsibility for a subsystem as well.', supervisor: 'Not Decided'},
      //'sensorNetwork': {name: 'Sensor Network', text: 'Gathering data is crucial to drive fast while preserving energy. The sensor network is responsible for gathering a lot of data and sending it to the central telemetry system.', supervisor: 'Not Decided'},
      //'telemetry': {name: 'Telemetry', text: 'To use the data from the network system, it has to be transmitted to a following computer. The telemtry system is responsible to transmit data over radio to be used in the driving strategy.', supervisor: 'Not Decided'},
      //'electricalSystem': {name: 'Electrical System', text: 'The car contains many small electrical components that needs to be controlled. This includes lighting, wipers, regenetive braking, horn, and more.', supervisor: 'Not Decided'},
      //'driverInterface': {name: 'Driver Interface', text: "Without the driver, the car won't drive. The driver interface is embedded in the dashboard, and needs to be designed so the driver can control the entire car with ease.", supervisor: 'Not Decided'},
      //'solarPanels': {name: 'Solar Panels', text: "Without the soalr panels, the car wouldn't be a solar racing car. The Solar Panels subgroup designs the electrical system around the solar array, as well as the control system for the panels to ensure full utilization of the array.", supervisor: 'Not Decided'},
      //'motors': {name: 'Motors', text: 'There are many ways to design electrical motors, but only the best designs deliver sufficient throughput with low weight usage. This subgroup desides how the motor system should look like, as well as the control units needed to run it.', supervisor: 'Not Decided'},
      //'electricalSystem': {name: 'Electrical System', text: 'To bring all the high voltage electrical components together to deliver as much power as possible, the electrical system has to be on point. This subgroup designs the electrical system, including the batteries, motors and solar panels, as well as the smaller electrical components.', supervisor: 'Not Decided'}
    },
    'mechanical': {
      'name': 'Mechanical',
      'image': 'Mechanical.png',
      'description': 'The mechanical group designs and builds all the dynamic mechanical systems of the solar car. Systems include braking, suspension and steering.',
      //'mechanicalEngineer': {name: 'Mechanical Engineer', text: 'All mechanical systems of the car, from the brakes to the chassis, has to be carefully chosen, designed and produced. Though a broad category, Nordlys needs members with skills or interest within many disciplines, including CAD and aerodynamics.', supervisor: 'Not decided'},
      'groupLeader': {name: 'Group Leader Mechanical', text: 'The group leader is the leader of the mechanical members. This is both a responsibility, and an oppurtunity of closer form the direction of the organization and the car. Most group leaders have responsibility for a subsystem as well.', supervisor: 'Not Decided'},
      //'braking': {name: 'Braking', text: 'Creating safe but lightweight brakes is a challenge, but one we must conquer to build a successful solar racing car. This system focuses on the design and building of the braking system.', supervisor: 'Not Decided'},
      //'suspension': {name: 'Suspension', text: 'This system focuses on designing a lightweight suspension system. Without it, driving the car becomes both unstable and uncomfortable.', supervisor: 'Not Decided'},
      //'steering': {name: 'Steering', text: 'The steering system needs to be precise and lightweight, as well as easy to manipulate by the driver. This subgroup designs, test and builds an efficient steering rig. ', supervisor: 'Not Decided'},
      //'drivetrain': {name: 'Drivetrain', text: "The drivetrain connects to the electric motors to deliver mechanical power to the wheels. Either if the car uses inwheel motors or external, the drivetrain needs to be lightweight and delver sufficent amounts of torque withoiut loosing too much energy on the way.", supervisor: 'Not Decided'},
      //'bearingStructure': {name: 'Bearing Structure', text: 'The car itself needs to carry both the driver and itself, while being lightweight and highly aerodynamic. This subgroup will be working on the design of the chassis and outer shell, testing and tweaking its aerodynamics and bearing characteristics until perfection.', supervisor: 'Not Decided'}
    }, 
    'chassis': {
      'name': 'Chassis',
      'image': 'Mechanical.png',
      'description': 'The chassis group designs and builds the structural components of the solar car. Systems include the roll cage and the outer shell of the car.',
      //'mechanicalEngineer': {name: 'Mechanical Engineer', text: 'All mechanical systems of the car, from the brakes to the chassis, has to be carefully chosen, designed and produced. Though a broad category, Nordlys needs members with skills or interest within many disciplines, including CAD and aerodynamics.', supervisor: 'Not decided'},
      'groupLeader': {name: 'Group Leader Chassis', text: 'The group leader is the leader of the chassis members. This is both a responsibility, and an oppurtunity of closer form the direction of the organization and the car. Most group leaders have responsibility for a subsystem as well.', supervisor: 'Not Decided'},
      //'braking': {name: 'Braking', text: 'Creating safe but lightweight brakes is a challenge, but one we must conquer to build a successful solar racing car. This system focuses on the design and building of the braking system.', supervisor: 'Not Decided'},
      //'suspension': {name: 'Suspension', text: 'This system focuses on designing a lightweight suspension system. Without it, driving the car becomes both unstable and uncomfortable.', supervisor: 'Not Decided'},
      //'steering': {name: 'Steering', text: 'The steering system needs to be precise and lightweight, as well as easy to manipulate by the driver. This subgroup designs, test and builds an efficient steering rig. ', supervisor: 'Not Decided'},
      //'drivetrain': {name: 'Drivetrain', text: "The drivetrain connects to the electric motors to deliver mechanical power to the wheels. Either if the car uses inwheel motors or external, the drivetrain needs to be lightweight and delver sufficent amounts of torque withoiut loosing too much energy on the way.", supervisor: 'Not Decided'},
      //'bearingStructure': {name: 'Bearing Structure', text: 'The car itself needs to carry both the driver and itself, while being lightweight and highly aerodynamic. This subgroup will be working on the design of the chassis and outer shell, testing and tweaking its aerodynamics and bearing characteristics until perfection.', supervisor: 'Not Decided'}
    }, 
    //'design': {
    //  'name': 'Design',
    //  'image': 'Design.png',
    //  'description': 'The design members work closely with the mechanical and electrical group to make the car both ergonomically and aesthetically satisfactory. The external design of the car becomes the symbol of the team as it travels through Norway and Australia. Having a comfortable and ergonomic car is also of high importance to the drivers who will be driving in the hot and dry Australian outback.',
    //  'groupLeader': {name: 'Group Leader Design', text: 'The group leader is the leader of the design members. This is both a responsibility, and an oppurtunity of closer form the direction of the organization and the car. Most group leaders have responsibility for a subsystem as well.', supervisor: 'Not Decided'},
    //  'designer': {name: 'Designer', text: '(2 students wanted) The designers are responsible for making the car both aesthetically pleasing and comfortable to use by the drivers. Both graphical designers and product designers have a central role in tying the human dimension into the development of the highly technical car.', supervisor: 'Not decided'}
    //  'exteriorDesign': {name: 'Exterior Design', text: 'Nothing is more important than presentation. The exterior design of the car should be visually attractive as well as showcase the Nordlys brand and sustainability of the project.', supervisor: 'Not Decided'},
    //  'ergonomicDesign': {name: 'Ergonomic Design', text: 'To ease the work of the driver, and give room to focus on the drving, the driver interface needs a human centered and ergonomic design. This includes the seat, seat belt and dashboard, which all need attention to detail and needs to be well tested to enhance the driver experience.', supervisor: 'Not Decided'}
    //},
    'strategy': {
      'name': 'Strategy',
      'image': 'Software.png',
      'description': 'The winning team needs a winning driving strategy. The strategy group develops software analysis tools to calculate the solar cars optimal speed.',
      //'strategist': {name: 'Strategist', text: "Finding out how fast the car can drive during the competition is a difficult task. The strategy team requires a highly interdisciplinary set of members, applying knowledge about physics, aerodynamics, coding and simulation together to build the basis of Nordlys' on-route driving strategy.", supervisor: 'Not decided'},
      'groupLeader': {name: 'Group Leader Strategy', text: 'The group leader is the leader of the strategy members. This is both a responsibility, and an oppurtunity of closer form the direction of the organization and the car. The group leader will also have responsibility for a part of the strategy system as well.', supervisor: 'Not Decided'},
      //'dataVisualization': {name: 'Data Visualization', text: "It's impossible to understand the thousands of data points sent from the car during a race just by looking at then. To make sense of the data, this subgroup develops a data visualization interface for the operators to use.", supervisor: 'Not Decided'},
      //'dataAnalysis': {name: 'Data Analysis', text: "To make sure the car drives as fast as possible without running out of energy, we need an algorithm. This subgroup develops a model and algorithm to predict future energy needs and suggest an optimal speed given inputs such as route profile, weather forecast and current energy throughputs.", supervisor: 'Not Decided'}
    },
    //'brand': {
      //'name': 'Brand',
      //'image': 'Brand.png',
      //'description': 'The Brand group is responsible for the development of the overall Brand of Nordlys. Given the young age of the organization, this is an important group that does not require a lot of previous experience.',
      //'keyAccountManager': {name: 'Key Account Manager', text: "Building strong and meaningful relationships with sponsors and the technology industri is key for the long term success of Nordlys. The key account managers are the team's external communication with the industry, applying and developing interpersonal skills to secure the Nordlys' funds.", supervisor: 'Not Decided'},
      //'brandDeveloper': {name: 'Brand Developer', text: "To reach our amibtios goals, we need a strong and recognizable brand. The brand developers build the brand through strategic marketing and social media, as well as planning and designing the organizations outer image and marketing plan.", supervisor: 'Not Decided'},
      //'photoVideo': {name: 'Photo and Video', text: "A good brand needs good and professional photos and videos. The photographers are responsible for capturing the team as we develop, build and compete with the Nordlys car.", supervisor: 'Not Decided'},
      //'webDeveloper': {name: 'Web Developer', text: "A proffesional website keeps the audience up to speed on the team and it's work. Develop and build the website, and tell the story of who Nordlys NTNU really are.", supervisor: 'Not Decided'},
      //'graphicalDesigner': {name: 'Graphical Designer', text: "One of the most important parts of building a recognizable brand is developing it's graphical profile. The graphical designer creates all the graphical content of Nordlys, either it is the logo, social media posts or recruitment posters.", supervisor: 'Not Decided'},
    //},
    //'logistics': {
      //'name': 'Logistics',
      //'image': 'Logistics.png',
      //'description': 'This completely new group is responsible for all the planning and logistics of the competition of 2025. Nordlys is going to Australia for the first time and need you to help us plan everything from the travel, the accommodations and the food.',
      //'logisticsEngineer': {name: 'Logistics Engineer', text: "As a logistics engineer you will be part of the small team responsible for the entire travel arrangements for the team going to Bridgestone World Solar Challenge 2025. This includes making sure we have enough food and water, that car is shipped on time and that all the members know where to be at what times. You will be working in a close group and no previous knowledge is needed.", supervisor: 'Not Decided'},
    //}
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