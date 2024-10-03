import { posix } from "path";
import Content from "./Content";
import TeamGroup from "./TeamGroup";
import Members from '../data/members'

export default function TeamOverview() {

    const overview = Members;

    return (
        <Content dark={false} >
            {
                Object.keys(overview).map((groupName, i) => (
                    <TeamGroup groupName={groupName} members={overview[groupName]["members"]} text={overview[groupName]["text"]} />
                ))
            }
        </Content >
    )
}