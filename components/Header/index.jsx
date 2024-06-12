import styles from "./Header.module.css";
import Link from "next/link";
import useLogout from "../../hooks/useLogout";

export default function Header(props) {
  const logout = useLogout();
  return (
    <header className={styles.container}>
      {props.isLoggedIn ? (
        <>
          <p>
            <Link href="/">Home</Link>
          </p>
          <div className={styles.container}>
            <p>Welcome, {props.username}!</p>
            <p onClick={logout} style={{ cursor: "pointer" }}>
              Logout
            </p>
          </div>
        </>
      ) : (
        <>
          <p>
            <Link href="/">Home</Link>
          </p>
          <p>
            <Link href="/login">Login</Link>
          </p>
        </>
      )}
    </header>
  );
}

