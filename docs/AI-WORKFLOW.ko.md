# Codex와 Claude Code 함께 사용하기

## 확인된 저장소
https://github.com/seoheelee326/seoheelee326.github.io
공개 저장소이며 기본 브랜치는 main입니다. README에 main에서 GitHub Pages로 배포한다고 기록되어 있습니다.
작가 홈페이지는 루트 index.html / styles.css / app.js / data/이며 elsdr-preview/는 같은 저장소의 별도 폴더입니다.
현재 package.json과 빌드 단계는 없습니다. 배포 소스의 세부 설정은 GitHub Settings > Pages에서 확인하세요.

## 1. 로컬 사본 준비
PowerShell에서 원하는 작업 폴더로 이동한 뒤 실행합니다. 이미 사본이 있으면 중복 복제하지 말고 그 사본의 git remote -v와 git status를 먼저 확인하세요.

```powershell
git clone https://github.com/seoheelee326/seoheelee326.github.io.git
cd seoheelee326.github.io
git switch -c codex/first-task
```

이 저장소는 공개이므로 복제에 토큰이 필요하지 않습니다. 푸시 인증은 GitHub의 브라우저 로그인 또는 Git Credential Manager를 사용하세요. 토큰을 URL에 넣지 마세요.

## 2. Codex 연결
데스크톱 앱에서 ChatGPT 계정으로 로그인한 뒤 Codex를 선택하고, 위에서 복제한 seoheelee326.github.io 폴더를 프로젝트로 여세요.
현재 대화의 생성 폴더와 복제한 홈페이지 폴더는 서로 다릅니다.
첫 요청에서 AGENTS.md를 읽고 작업 브랜치와 대상 영역을 확인하게 하세요.

클라우드 사용 시 Codex Cloud에서 환경을 만들고 GitHub 연결을 진행한 뒤 seoheelee326/seoheelee326.github.io를 선택합니다.
GitHub 설치 권한을 고를 수 있으면 이 저장소만 허용합니다. 환경 준비 결과를 검토하고 Publish한 뒤 작업을 시작하세요.
여기서 환경 Publish와 실제 홈페이지 배포는 다른 작업입니다.
현재 대화의 GitHub 연결이 클라우드 환경이나 로컬 Git 푸시 인증까지 자동 설정했다는 의미는 아닙니다.

공식 안내:
- https://learn.chatgpt.com/docs/quickstart
- https://learn.chatgpt.com/docs/cloud

## 3. Claude Code 연결
현재 점검한 터미널 PATH에서는 claude 명령을 찾지 못했습니다. 다른 위치에 설치되어 있는지는 확인하지 않았습니다.
Windows PowerShell에서 설치가 필요한 경우 공식 WinGet 방식:

```powershell
winget install Anthropic.ClaudeCode
```

터미널을 다시 열어 복제 폴더로 이동하고 claude를 실행한 다음 화면의 계정 로그인 절차를 완료하세요.
Git for Windows는 일반 터미널의 Git 사용과 Git Bash를 위해 권장합니다.
API 키를 홈페이지 파일에 넣을 필요가 없습니다.
CLAUDE.md가 @AGENTS.md를 가져오므로 두 도구가 같은 작업 규칙을 사용합니다.
Claude에서 /context로 Memory files를 확인하세요.

공식 안내:
- https://code.claude.com/docs/en/setup
- https://code.claude.com/docs/en/memory

## 4. 함께 작업하는 순서
1. Codex 또는 Claude 한 도구가 작업 브랜치에서 수정합니다.
2. diff와 로컬 미리보기를 확인하고 커밋합니다.
3. 작업 브랜치만 푸시하고 GitHub에서 main 대상 Draft PR을 만듭니다.
4. 다른 도구가 PR diff를 검토합니다. 검토 도구는 같은 폴더에서 동시에 수정하지 않습니다.
5. 작성 도구가 지적사항을 반영하고 다시 확인합니다.
6. 사용자가 PR을 확인한 후 병합합니다. main 병합은 홈페이지 배포로 이어질 수 있습니다.

동시 작업은 별도 worktree에서 하세요. 저장소 루트에서 아래처럼 만들 수 있습니다.
main 작업 폴더에 미커밋 변경이 있으면 먼저 그 상태를 보존하세요.

```powershell
git fetch origin
git worktree add ../homepage-claude -b claude/separate-task origin/main
```

Codex는 기존 codex/<task> 폴더, Claude는 homepage-claude 폴더를 엽니다.
서로 다른 작업을 병렬로 진행한 경우 첫 PR 병합 후 나머지 브랜치에 최신 main을 반영하고 다시 검증하세요.

## 5. 로컬 미리보기
Python이 설치되어 있다면 저장소 루트에서:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

브라우저에서 http://127.0.0.1:8000/ 또는 http://127.0.0.1:8000/elsdr-preview/ 를 확인합니다.
Python이 없으면 편집기의 로컬 HTTP 서버를 사용할 수 있습니다.
개발 브랜치를 만든 것만으로 공개 미리보기 URL이 생성되지는 않습니다.

## 6. 권장 GitHub 보호 설정
Settings > Rules > Rulesets에서 main을 대상으로 PR을 통한 변경과 force push·삭제 차단을 검토하세요.
혼자 관리하는 경우 본인 PR에 대한 타인 승인 1개를 무조건 요구하면 병합이 막힐 수 있습니다.
CI가 없는 상태에서 존재하지 않는 필수 검사를 지정하지 마세요.
현재 안내 파일은 보호 규칙을 자동 적용하지 않습니다.

## 바로 사용할 요청
작성 도구:
“AGENTS.md를 읽고 현재 브랜치와 변경 상태를 확인해줘. 대상은 [작가 홈페이지 또는 elsdr-preview]야. [요청]을 작업 브랜치에서 수정하고 확인 결과와 Draft PR을 준비해줘. main 병합은 하지 마.”

검토 도구:
“이 PR의 변경 파일과 diff를 읽고 오류·모바일 표시·기존 동작에 미치는 영향을 검토해줘. 수정이나 병합 없이 근거와 확인하지 못한 항목을 알려줘.”
