import Content from "../../components/Content";
import styles from '../styles/Groups.module.css';
import Group from "./Group";

export default function({ dark, groups }) {
    return (
        <Content id="groups" dark={dark}>
            <div className={styles.container}>
                {
                    Object.keys(groups).map((groupName, i) => (
                        <Group image={groups[groupName]['image']} groupName={groups[groupName].name} description={groups[groupName]['description']} theses={groups[groupName]} />
                    ))
                }
            </div>
        </Content>
    )
}