import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.footerText}>
        <a href='https://open.assembly.go.kr/portal/openapi/main.do' target='_blank' >열린국회정보</a>의 데이터와 일부 언론 등을 통해 수집한 자료를 활용하였습니다.<br />
        짬짬히 변경 중이라 기능상 오류가 발생할 수 있습니다.
      </p>
    </footer>
  );
}