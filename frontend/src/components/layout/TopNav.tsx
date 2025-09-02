// component for the Nav bar at the top
import { NavLink } from "react-router-dom";
import styles from "./TopNav.module.css";

export default function TopNav() {
  // the different routes that the application can navigate to
  const items = [
    { to: "/dashboard/clients", label: "Clients" },
    { to: "/dashboard/bookings", label: "Bookings" },
    { to: "/dashboard/videos", label: "Videos" },
    { to: "/dashboard/social-posts", label: "Social Posts" },
  ];

  return (
    <nav className={styles.topnav}>
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end
          className={({ isActive }) =>
            [styles.link, isActive ? styles.active : ""].join(" ")
          }
        >
          {it.label}
        </NavLink>
      ))}
    </nav>
  );
}
