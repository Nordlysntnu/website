import Content from "./Content";
import styles from '../styles/Groups.module.css';
import Group from "./Group";

export default function({ dark, groups }) {
    return (
        <Content dark={dark}>
            <div className={styles.container}>
                {
                    Object.keys(groups).map((groupName, i) => (
                        <Group image={groups[groupName]['image']} groupName={groups[groupName].name} theses={groups[groupName]} />
                    ))
                }
            </div>
        </Content>
    )
}