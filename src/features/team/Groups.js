import Content from "@shared/components/Content";
import styles from './styles/Groups.module.css';
import Group from "./Group";

export default function({ dark, groups }) {
    return (
        <Content id="groups" dark={dark}>
            <div className={styles.container}>
                {
                    Object.keys(groups).map((groupName) => {
                        const group = groups[groupName];
                        return (
                        <Group key={groupName} image={group.image} groupName={group.name} description={group.description} theses={group} />
                    );
                })}
            </div>
        </Content>
    )
}