import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.nav}`}>
        <Link href="/" className={styles.logo}>
          DogCare
        </Link>
        <div className={styles.links}>
          <Link href="/dogs" className={styles.link}>
            Собаки
          </Link>
        </div>
        <div className={styles.authGroup}>
          <Link href="/auth/login" className={styles.btnLogin}>
            Войти
          </Link>
          <Link href="/auth/register" className={styles.btnRegister}>
            Регистрация
          </Link>
        </div>
      </div>
    </header>
  );
}
