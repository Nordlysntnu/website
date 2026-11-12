// Group icons with their dark-mode versions (made by scripts/make-dark-icons.mjs).
import Management from '@assets/symbols-and-logos/Management.png';
import ManagementDark from '@assets/symbols-and-logos/ManagementDark.png';
import Business from '@assets/symbols-and-logos/Business.png';
import BusinessDark from '@assets/symbols-and-logos/BusinessDark.png';
import Marketing from '@assets/symbols-and-logos/Marketing.png';
import MarketingDark from '@assets/symbols-and-logos/MarketingDark.png';
import Logistics from '@assets/symbols-and-logos/Logistics.png';
import LogisticsDark from '@assets/symbols-and-logos/LogisticsDark.png';
import Chassis from '@assets/symbols-and-logos/Chassis.png';
import ChassisDark from '@assets/symbols-and-logos/ChassisDark.png';
import Mechanical from '@assets/symbols-and-logos/Mechanical.png';
import MechanicalDark from '@assets/symbols-and-logos/MechanicalDark.png';
import EmbeddedElectronics from '@assets/symbols-and-logos/EmbeddedElectronics.png';
import EmbeddedElectronicsDark from '@assets/symbols-and-logos/EmbeddedElectronicsDark.png';
import Software from '@assets/symbols-and-logos/Software.png';
import SoftwareDark from '@assets/symbols-and-logos/SoftwareDark.png';

const icon = (light, dark) => ({ light: light.src, dark: dark.src });

// Keys match the group keys in src/markdown/join.md.
export const groupIcons = {
    board: icon(Management, ManagementDark),
    business: icon(Business, BusinessDark),
    marketing: icon(Marketing, MarketingDark),
    logistics: icon(Logistics, LogisticsDark),
    'aero-&-composites': icon(Chassis, ChassisDark),
    mechanical: icon(Mechanical, MechanicalDark),
    electrical: icon(EmbeddedElectronics, EmbeddedElectronicsDark),
    software: icon(Software, SoftwareDark),
};
