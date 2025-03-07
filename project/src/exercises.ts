export interface Exercise {
  id: number;
  title: string;
  description: string;
  initialCode: string;
  solution: string;
}

export const exercises: Exercise[] = [
  {
    id: 1,
    title: "Einfache Webseite",
    description: "Rücke diese einfache Webseite richtig ein. Beachte die Verschachtelung der Elemente!",
    initialCode: `<html><head><title>Meine erste Webseite</title></head><body><h1>Willkommen!</h1><div><p>Das ist ein Paragraph.</p><ul><li>Erster Punkt</li><li>Zweiter Punkt</li></ul></div></body></html>`,
    solution: `<html>
  <head>
    <title>Meine erste Webseite</title>
  </head>
  <body>
    <h1>Willkommen!</h1>
    <div>
      <p>Das ist ein Paragraph.</p>
      <ul>
        <li>Erster Punkt</li>
        <li>Zweiter Punkt</li>
      </ul>
    </div>
  </body>
</html>`
  },
  {
    id: 2,
    title: "Navigation",
    description: "Formatiere diese Navigation richtig. Achte auf die verschachtelten Listen!",
    initialCode: `<nav><ul><li><a href="/">Start</a></li><li><a href="/ueber">Über uns</a><ul><li><a href="/team">Team</a></li><li><a href="/geschichte">Geschichte</a></li></ul></li></ul></nav>`,
    solution: `<nav>
  <ul>
    <li>
      <a href="/">Start</a>
    </li>
    <li>
      <a href="/ueber">Über uns</a>
      <ul>
        <li>
          <a href="/team">Team</a>
        </li>
        <li>
          <a href="/geschichte">Geschichte</a>
        </li>
      </ul>
    </li>
  </ul>
</nav>`
  }
];