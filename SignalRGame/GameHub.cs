using Microsoft.AspNetCore.SignalR;
using SignalRGame.Models;

namespace SignalRGame
{
	public static class UserHandler
	{
		public static HashSet<Player> Users = new HashSet<Player>();
	}
	public class GameHub : Hub
	{
		public async Task SendMesage(string user, string message)
		{
			await Clients.All.SendAsync("ReceiveMessage", user, message);
		}
		public async Task SendPosition(string user, object transform, object animation)
		{
			var _user = UserHandler.Users.FirstOrDefault(v => v.Name == user);
			await Clients.AllExcept(_user.ID).SendAsync("ReceivePosition", user, transform, animation);
		}

		public async Task GetCurrentPlayer(string username)
		{
			var _user = UserHandler.Users.FirstOrDefault(v => v.Name == username);
			await Clients.Client(_user.ID).SendAsync("CurrentPlayer", _user);
		}

		public async override Task OnConnectedAsync()
		{
			var _user = new Player()
			{
				ID = Context.ConnectionId,
				Name = Context.GetHttpContext().Request.Query["username"]
			};
			await Clients.Client(_user.ID).SendAsync("GetPlayers", UserHandler.Users);
			UserHandler.Users.Add(_user);
			await Clients.AllExcept(_user.ID).SendAsync("Join", _user);
			await Clients.All.SendAsync("UpdatePlayers", UserHandler.Users);
		}

		public async override Task OnDisconnectedAsync(Exception exception)
		{
			var _user = UserHandler.Users.FirstOrDefault(v => v.ID == Context.ConnectionId);
			UserHandler.Users.Remove(_user);
			await Clients.All.SendAsync("UpdatePlayers", UserHandler.Users);
			await Clients.AllExcept(_user.ID).SendAsync("Disconnect", _user);
		}
	}
}