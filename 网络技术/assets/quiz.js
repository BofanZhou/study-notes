/* ============================================================
   测验组件（可复用）
   用法：在 HTML 中放置：
   <div class="quiz" data-quiz='[{"q":"问题","opts":["A","B","C"],"answer":0,"why":"解释"},...]'></div>
   并引入本脚本。答案选项长度应一致，避免泄露线索。
   ============================================================ */
(function () {
  "use strict";

  const stats = { correct: 0, answered: 0, total: 0 };
  let scoreShown = false;

  function renderQuiz(container) {
    let data;
    try {
      data = JSON.parse(container.getAttribute("data-quiz"));
    } catch (e) {
      console.error("data-quiz JSON 解析失败", e);
      return;
    }
    stats.total += data.length;

    data.forEach(function (item) {
      const q = document.createElement("div");
      q.className = "quiz-q";
      q.textContent = item.q;
      container.appendChild(q);

      const ul = document.createElement("ul");
      ul.className = "quiz-opts";

      const feedback = document.createElement("div");
      feedback.className = "quiz-feedback";

      let answered = false;

      item.opts.forEach(function (optText, idx) {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.className = "quiz-opt";
        btn.type = "button";
        btn.textContent = optText;
        btn.addEventListener("click", function () {
          if (answered) return;
          answered = true;
          stats.answered++;
          const buttons = ul.querySelectorAll(".quiz-opt");
          buttons.forEach(function (b, i) {
            b.disabled = true;
            if (i === item.answer) b.classList.add("correct");
          });
          if (idx === item.answer) {
            stats.correct++;
            feedback.textContent = "✓ 正确。" + (item.why || "");
          } else {
            btn.classList.add("wrong");
            feedback.textContent =
              "✗ 正确答案是绿色那项。" + (item.why || "");
          }
          feedback.style.display = "block";
          maybeShowScore();
        });
        li.appendChild(btn);
        ul.appendChild(li);
      });

      container.appendChild(ul);
      container.appendChild(feedback);
    });
  }

  function maybeShowScore() {
    if (scoreShown || stats.answered < stats.total) return;
    scoreShown = true;
    const lastQuiz = document.querySelector(".quiz[data-quiz]:last-of-type")
      || document.querySelector(".quiz[data-quiz]");
    const score = document.createElement("div");
    score.className = "quiz-score";
    score.textContent =
      "本次得分：" + stats.correct + " / " + stats.total +
      (stats.correct === stats.total
        ? "　🎉 全部正确！"
        : "　答错的题目值得明天回来重测一次——间隔重复才是长期记忆之道。");
    score.style.display = "block";
    lastQuiz.parentNode.appendChild(score);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".quiz[data-quiz]").forEach(renderQuiz);
  });
})();
