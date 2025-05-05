using UnityEditor;
public class BuildScript {
    public static void BuildWebGL() {
        BuildPipeline.BuildPlayer(
            new[] { "Assets/Scenes/MainScene.unity" },
            "Build/WebGL",
            BuildTarget.WebGL,
            BuildOptions.None
        );
    }
}
