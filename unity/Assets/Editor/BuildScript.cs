using UnityEditor;
using System;

public class BuildScript
{
    public static void BuildWebGL()
    {
        string[] scenes = { "Assets/Scenes/SampleScene.unity" }; // ←使ってるシーンに合わせて変更
        BuildPipeline.BuildPlayer(scenes, "Build/WebGL", BuildTarget.WebGL, BuildOptions.None);
        Console.WriteLine("✅ WebGL ビルド完了");
    }
}
