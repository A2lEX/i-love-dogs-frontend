import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.content}>
          <img src="/logo.svg" alt="DogCare" width={120} height={28} className={styles.brand} />
          <span className={styles.copy}>&copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
