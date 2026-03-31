import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.content}>
          <span className={styles.brand}>DogCare</span>
          <span className={styles.copy}>&copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
