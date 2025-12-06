default:
    echo 'Hello, world!'


clear:
    git rm --cached -r .
push:
  git add . && git commit -m 'Update' && git push repo main 