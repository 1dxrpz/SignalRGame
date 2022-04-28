using Microsoft.AspNetCore.Mvc;
using SignalRGame.Models;

namespace SignalRGame.Controllers
{
	public class GameController : Controller
	{
		[HttpPost]
		public IActionResult Index([FromForm] Player player)
		{
			
			if (player == null) return null;
			
			return View(player);
		}
	}
}
